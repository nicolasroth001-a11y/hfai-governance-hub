// HFAI Guard auto-provisioning endpoint.
// Called by the Chrome extension on first install.
// Creates an organization + invisible "free" account and returns
// the org's API key, which the extension uses for all future ingest-event calls.
//
// Public endpoint (no JWT required) — protected by:
//   • input validation
//   • per-device-token uniqueness (idempotent)
//   • org is created with signup_via_guard=true so we can rate-limit / segment later

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const log = (s: string, d?: unknown) =>
  console.log(`[GUARD-REGISTER] ${s}${d ? ` – ${JSON.stringify(d)}` : ""}`);

function generateApiKey(): string {
  // 32 random bytes, base32-ish, prefixed so it's identifiable
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "")
    .replace(/\//g, "")
    .replace(/=/g, "");
  return `hfai_guard_${b64}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const deviceToken: string = String(body.device_token || "").trim();
    const email: string | null = body.email ? String(body.email).trim().toLowerCase() : null;
    const userAgent: string = String(body.user_agent || req.headers.get("user-agent") || "").slice(0, 500);
    const browser: string = String(body.browser || "chrome").slice(0, 32);
    const installSource: string = String(body.install_source || "extension").slice(0, 64);

    if (!deviceToken || deviceToken.length < 16 || deviceToken.length > 128) {
      return new Response(JSON.stringify({ error: "Invalid device_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Idempotent: if this device already registered, just return its existing key
    const { data: existingDevice } = await supabase
      .from("guard_devices")
      .select("id, org_id")
      .eq("device_token", deviceToken)
      .maybeSingle();

    if (existingDevice) {
      log("Existing device — returning current key", { deviceId: existingDevice.id });
      const { data: org } = await supabase
        .from("organizations")
        .select("id, api_key")
        .eq("id", existingDevice.org_id)
        .single();

      // Touch last_seen
      await supabase
        .from("guard_devices")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", existingDevice.id);

      return new Response(
        JSON.stringify({
          api_key: org?.api_key,
          org_id: org?.id,
          dashboard_url: "https://hfa-i.org/customer/guard",
          existing: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fresh install — create a brand-new anonymous organization
    const apiKey = generateApiKey();
    const orgName = email ? `${email.split("@")[0]}'s workspace` : "Guard workspace";

    const { data: newOrg, error: orgErr } = await supabase
      .from("organizations")
      .insert({
        name: orgName,
        contact_email: email || "",
        api_key: apiKey,
        signup_via_guard: true,
      })
      .select("id, api_key")
      .single();

    if (orgErr || !newOrg) {
      log("Org create failed", { error: orgErr?.message });
      return new Response(JSON.stringify({ error: "Could not provision workspace" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: devErr } = await supabase.from("guard_devices").insert({
      org_id: newOrg.id,
      device_token: deviceToken,
      email,
      user_agent: userAgent,
      browser,
      install_source: installSource,
    });

    if (devErr) {
      log("Device insert failed (non-fatal)", { error: devErr.message });
    }

    log("Provisioned new Guard org", { orgId: newOrg.id });

    return new Response(
      JSON.stringify({
        api_key: newOrg.api_key,
        org_id: newOrg.id,
        dashboard_url: "https://hfa-i.org/customer/guard",
        existing: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    log("ERROR", { error: String(e) });
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
