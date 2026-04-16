// Dispatches violation/event alerts to configured integrations.
// Phase 1: Slack, Teams, S3, Custom Webhook
// Phase 2: Jira (issue creation), Snowflake (queued for nightly export), Datadog (event), PagerDuty (incident)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DispatchRequest {
  org_id?: string;
  integration_id?: string;
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
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { status: res.status, ok: res.ok, text: await res.text() };
}

async function sendTeams(webhookUrl: string, body: any) {
  const card = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: body.severity === "critical" ? "C4181C" : "C4993A",
    summary: body.title, title: body.title, text: body.summary,
    sections: body.violation_id ? [{ facts: [{ name: "Violation ID", value: body.violation_id }] }] : undefined,
  };
  const res = await fetch(webhookUrl, {
    method: "POST", headers: { "Content-Type": "application/json" },
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

// JIRA — Create an issue via Atlassian REST API v3
async function sendJira(cfg: any, body: any) {
  if (!cfg.base_url || !cfg.email || !cfg.api_token || !cfg.project_key) {
    throw new Error("Jira requires base_url, email, api_token, project_key");
  }
  const auth = btoa(`${cfg.email}:${cfg.api_token}`);
  const issuePayload = {
    fields: {
      project: { key: cfg.project_key },
      summary: `[HFAI] ${body.title}`.slice(0, 250),
      description: {
        type: "doc", version: 1,
        content: [{
          type: "paragraph",
          content: [{ type: "text", text: `${body.summary}\n\nSeverity: ${body.severity ?? "n/a"}\nViolation ID: ${body.violation_id ?? "n/a"}\nEvent: ${body.event_type}` }],
        }],
      },
      issuetype: { name: cfg.issue_type ?? "Task" },
      ...(cfg.priority ? { priority: { name: cfg.priority } } : {}),
    },
  };
  const url = `${cfg.base_url.replace(/\/$/, "")}/rest/api/3/issue`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(issuePayload),
  });
  return { status: res.status, ok: res.ok, text: await res.text() };
}

// DATADOG — Post an event to the events API
async function sendDatadog(cfg: any, body: any) {
  if (!cfg.api_key) throw new Error("Datadog requires api_key");
  const site = cfg.site ?? "datadoghq.com";
  const alertType = body.severity === "critical" ? "error" : body.severity === "high" ? "warning" : "info";
  const payload = {
    title: `[HFAI] ${body.title}`,
    text: body.summary,
    alert_type: alertType,
    source_type_name: "hfai",
    tags: [`severity:${body.severity ?? "info"}`, `event:${body.event_type}`, ...(body.violation_id ? [`violation_id:${body.violation_id}`] : [])],
  };
  const res = await fetch(`https://api.${site}/api/v1/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "DD-API-KEY": cfg.api_key },
    body: JSON.stringify(payload),
  });
  return { status: res.status, ok: res.ok, text: await res.text() };
}

// PAGERDUTY — Trigger an incident via Events API v2
async function sendPagerDuty(cfg: any, body: any) {
  if (!cfg.routing_key) throw new Error("PagerDuty requires routing_key (Events API v2 integration key)");
  const sev = body.severity === "critical" ? "critical" : body.severity === "high" ? "error" : "warning";
  const payload = {
    routing_key: cfg.routing_key,
    event_action: "trigger",
    dedup_key: body.violation_id ?? undefined,
    payload: {
      summary: `[HFAI] ${body.title}`.slice(0, 1024),
      severity: sev,
      source: "hfai",
      component: body.event_type,
      custom_details: {
        violation_id: body.violation_id, event_type: body.event_type,
        message: body.summary, severity: body.severity,
      },
    },
  };
  const res = await fetch("https://events.pagerduty.com/v2/enqueue", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
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

    let q = supabase.from("integrations").select("*").eq("org_id", orgId).eq("enabled", true);
    if (body.integration_id) q = q.eq("id", body.integration_id);
    const { data: integrations, error: intErr } = await q;
    if (intErr) throw intErr;

    const messageBody = body.payload ?? {
      title: body.message || `HFAI Alert: ${body.event_type.replace(/_/g, " ")}`,
      summary: body.message || `A ${body.event_type} event was triggered.`,
      severity: body.event_type === "critical" ? "critical" : body.event_type === "high_severity" ? "high" : "info",
      violation_id: body.violation_id,
      event_type: body.event_type,
      timestamp: new Date().toISOString(),
    };

    const results: any[] = [];
    for (const integ of integrations ?? []) {
      if (
        body.event_type !== "manual_test" &&
        Array.isArray(integ.trigger_events) &&
        integ.trigger_events.length > 0 &&
        !integ.trigger_events.includes(body.event_type)
      ) continue;

      const cfg = (integ.config ?? {}) as Record<string, any>;
      let result: { status: number; ok: boolean; text: string };
      try {
        switch (integ.integration_type) {
          case "slack":
            if (!cfg.webhook_url) throw new Error("Slack webhook_url not configured");
            result = await sendSlack(cfg.webhook_url, cfg.channel, messageBody); break;
          case "teams":
            if (!cfg.webhook_url) throw new Error("Teams webhook_url not configured");
            result = await sendTeams(cfg.webhook_url, messageBody); break;
          case "webhook_custom":
            if (!cfg.url) throw new Error("Custom webhook URL not configured");
            result = await sendCustomWebhook(cfg.url, cfg.secret, messageBody); break;
          case "s3":
            result = { status: 202, ok: true, text: "Queued for S3 export (nightly)" }; break;
          case "jira":
            result = await sendJira(cfg, messageBody); break;
          case "datadog":
            result = await sendDatadog(cfg, messageBody); break;
          case "pagerduty":
            result = await sendPagerDuty(cfg, messageBody); break;
          case "snowflake":
            result = { status: 202, ok: true, text: "Queued for Snowflake nightly export" }; break;
          default:
            throw new Error(`Unknown integration_type: ${integ.integration_type}`);
        }

        await supabase.from("integration_deliveries").insert({
          integration_id: integ.id, org_id: orgId, event_type: body.event_type,
          payload: messageBody, success: result.ok,
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
