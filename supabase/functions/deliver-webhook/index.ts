import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, d?: unknown) =>
  console.log(`[DELIVER-WEBHOOK] ${step}${d ? ` – ${JSON.stringify(d)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { violation_id, event_type = "violation.created" } = await req.json();
    if (!violation_id) {
      return new Response(JSON.stringify({ error: "violation_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log("Processing webhook delivery", { violation_id, event_type });

    // Fetch violation
    const { data: violation, error: vErr } = await supabase
      .from("violations")
      .select("*")
      .eq("id", violation_id)
      .single();

    if (vErr || !violation) {
      return new Response(JSON.stringify({ error: "Violation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch webhook endpoints for this org
    const { data: webhooks } = await supabase
      .from("webhook_endpoints")
      .select("*")
      .eq("org_id", violation.org_id)
      .eq("enabled", true);

    if (!webhooks || webhooks.length === 0) {
      log("No webhook endpoints configured");
      return new Response(
        JSON.stringify({ delivered: 0, reason: "No endpoints configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build webhook payload
    const payload = {
      event: event_type,
      violation_id: violation.id,
      rule_id: violation.rule_id,
      severity: violation.severity,
      description: violation.description,
      ai_system_id: violation.ai_system_id,
      status: violation.status,
      timestamp: violation.detected_at || violation.created_at,
      org_id: violation.org_id,
    };

    // Deliver to each endpoint
    let delivered = 0;
    let failed = 0;

    for (const webhook of webhooks) {
      // Filter by event type if the endpoint has event filters
      if (webhook.events && Array.isArray(webhook.events) && webhook.events.length > 0) {
        if (!webhook.events.includes(event_type)) {
          log("Skipping endpoint (event filter)", { endpoint: webhook.url, event_type });
          continue;
        }
      }

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "User-Agent": "HFAI-Webhook/1.0",
          "X-HFAI-Event": event_type,
          "X-HFAI-Delivery": crypto.randomUUID(),
        };

        // Add signing secret if configured
        if (webhook.secret) {
          const encoder = new TextEncoder();
          const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(webhook.secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const signature = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(JSON.stringify(payload))
          );
          const hexSig = Array.from(new Uint8Array(signature))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          headers["X-HFAI-Signature"] = `sha256=${hexSig}`;
        }

        const res = await fetch(webhook.url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (res.ok) {
          delivered++;
          log("Webhook delivered", { url: webhook.url, status: res.status });
        } else {
          failed++;
          log("Webhook delivery failed", { url: webhook.url, status: res.status });
        }

        // Log delivery attempt
        await supabase.from("webhook_deliveries").insert({
          webhook_endpoint_id: webhook.id,
          org_id: violation.org_id,
          event_type,
          payload,
          response_status: res.status,
          success: res.ok,
        });
      } catch (err) {
        failed++;
        log("Webhook delivery error", { url: webhook.url, error: String(err) });

        await supabase.from("webhook_deliveries").insert({
          webhook_endpoint_id: webhook.id,
          org_id: violation.org_id,
          event_type,
          payload,
          response_status: 0,
          success: false,
          error_message: String(err),
        });
      }
    }

    return new Response(
      JSON.stringify({ delivered, failed, total: webhooks.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    log("ERROR", { message: String(err) });
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
