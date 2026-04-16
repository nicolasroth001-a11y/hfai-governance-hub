// Dispatches violation/event alerts to configured integrations (Slack, Teams, S3, Webhooks).
// Called by triggers, edge functions, or directly from the UI ("Send to Slack" button).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DispatchRequest {
  org_id?: string;
  integration_id?: string; // optional: target one specific integration
  event_type: "new_violation" | "high_severity" | "critical" | "pattern_detected" | "manual_test";
  violation_id?: string;
  payload?: Record<string, unknown>;
  message?: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function fmt(text: string): string {
  return text.length > 2500 ? text.slice(0, 2500) + "…" : text;
}

async function sendSlack(webhookUrl: string, channel: string | undefined, body: any) {
  const text = `*${body.title}*\n${body.summary}${body.violation_id ? `\n\n_Violation:_ \`${body.violation_id}\`` : ""}`;
  const payload: Record<string, unknown> = {
    text: fmt(text),
    blocks: [
      { type: "header", text: { type: "plain_text", text: body.title.slice(0, 150) } },
      { type: "section", text: { type: "mrkdwn", text: fmt(body.summary) } },
    ],
  };
  if (channel) payload.channel = channel;
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { status: res.status, ok: res.ok, text: await res.text() };
}

async function sendTeams(webhookUrl: string, body: any) {
  const card = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: body.severity === "critical" ? "C4181C" : "C4993A",
    summary: body.title,
    title: body.title,
    text: body.summary,
    sections: body.violation_id
      ? [{ facts: [{ name: "Violation ID", value: body.violation_id }] }]
      : undefined,
  };
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });
  return { status: res.status, ok: res.ok, text: await res.text() };
}

async function sendCustomWebhook(url: string, secret: string | undefined, body: any) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret) headers["X-HFAI-Signature"] = secret;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  return { status: res.status, ok: res.ok, text: await res.text() };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const body: DispatchRequest = await req.json();
    if (!body.event_type) throw new Error("event_type is required");

    let orgId = body.org_id;
    if (!orgId && authHeader) {
      // Resolve org from caller's profile
      const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles").select("org_id").eq("id", user.id).single();
        orgId = profile?.org_id ?? undefined;
      }
    }
    if (!orgId) throw new Error("org_id could not be determined");

    // Fetch active integrations for this org
    let q = supabase.from("integrations").select("*").eq("org_id", orgId).eq("enabled", true);
    if (body.integration_id) q = q.eq("id", body.integration_id);
    const { data: integrations, error: intErr } = await q;
    if (intErr) throw intErr;

    const messageBody = body.payload ?? {
      title: body.message || `HFAI Alert: ${body.event_type.replace(/_/g, " ")}`,
      summary: body.message || `A ${body.event_type} event was triggered.`,
      severity: body.event_type === "critical" ? "critical" : "high",
      violation_id: body.violation_id,
      event_type: body.event_type,
      timestamp: new Date().toISOString(),
    };

    const results: any[] = [];
    for (const integ of integrations ?? []) {
      // Filter by configured trigger_events (manual_test always sends)
      if (
        body.event_type !== "manual_test" &&
        Array.isArray(integ.trigger_events) &&
        integ.trigger_events.length > 0 &&
        !integ.trigger_events.includes(body.event_type)
      ) continue;

      const cfg = (integ.config ?? {}) as Record<string, any>;
      let result: { status: number; ok: boolean; text: string };
      try {
        if (integ.integration_type === "slack") {
          if (!cfg.webhook_url) throw new Error("Slack webhook_url not configured");
          result = await sendSlack(cfg.webhook_url, cfg.channel, messageBody);
        } else if (integ.integration_type === "teams") {
          if (!cfg.webhook_url) throw new Error("Teams webhook_url not configured");
          result = await sendTeams(cfg.webhook_url, messageBody);
        } else if (integ.integration_type === "webhook_custom") {
          if (!cfg.url) throw new Error("Custom webhook URL not configured");
          result = await sendCustomWebhook(cfg.url, cfg.secret, messageBody);
        } else if (integ.integration_type === "s3") {
          // S3 export is async/batch — record intent, actual upload via scheduled job
          result = { status: 202, ok: true, text: "Queued for S3 export" };
        } else {
          throw new Error(`Unknown integration_type: ${integ.integration_type}`);
        }

        await supabase.from("integration_deliveries").insert({
          integration_id: integ.id,
          org_id: orgId,
          event_type: body.event_type,
          payload: messageBody,
          success: result.ok,
          response_status: result.status,
          error_message: result.ok ? null : result.text.slice(0, 500),
        });

        if (result.ok) {
          await supabase.from("integrations")
            .update({ last_delivered_at: new Date().toISOString(), last_error: null })
            .eq("id", integ.id);
        } else {
          await supabase.from("integrations")
            .update({ last_error: result.text.slice(0, 500) })
            .eq("id", integ.id);
        }
        results.push({ id: integ.id, type: integ.integration_type, ok: result.ok, status: result.status });
      } catch (e: any) {
        await supabase.from("integration_deliveries").insert({
          integration_id: integ.id, org_id: orgId, event_type: body.event_type,
          payload: messageBody, success: false, error_message: String(e?.message ?? e).slice(0, 500),
        });
        await supabase.from("integrations")
          .update({ last_error: String(e?.message ?? e).slice(0, 500) })
          .eq("id", integ.id);
        results.push({ id: integ.id, type: integ.integration_type, ok: false, error: String(e?.message ?? e) });
      }
    }

    return new Response(JSON.stringify({ dispatched: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (e: any) {
    console.error("integration-dispatch error", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});
