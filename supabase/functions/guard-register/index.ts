// HFAI Guard auto-provisioning endpoint.
// Called by the Chrome extension on first install.
// Creates an organization + invisible "free" account and returns
// the org's API key, which the extension uses for all future ingest-event calls.
//
// Public endpoint (no JWT required) — protected by:
//   • Zod input validation (strict types, length limits)
//   • per-device-token uniqueness (idempotent)
//   • per-IP daily soft cap (anti-flood: max 20 fresh provisions / IP / day)
//   • org tagged signup_via_guard=true for downstream segmentation
//
// NOTE: We deliberately do NOT do per-request rate limiting here — backend
// rate-limit primitives are still maturing. The IP cap above + idempotency
// is sufficient for v1.0.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const log = (s: string, d?: unknown) =>
  console.log(JSON.stringify({ fn: "guard-register", msg: s, ...(d ? { data: d } : {}) }));

const RegisterSchema = z.object({
  device_token: z.string().trim().min(16).max(128),
  email: z.string().trim().toLowerCase().email().max(255).optional().nullable(),
  user_agent: z.string().max(500).optional(),
  browser: z.string().max(32).optional(),
  install_source: z.string().max(64).optional(),
});

const IP_DAILY_CAP = 20;

function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "")
    .replace(/\//g, "")
    .replace(/=/g, "");
  return `hfai_guard_${b64}`;
}

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "";
  return fwd.split(",")[0].trim() || "unknown";
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
    const raw = await req.json().catch(() => ({}));
    const parsed = RegisterSchema.safeParse(raw);
    if (!parsed.success) {
      log("Invalid input", { errors: parsed.error.flatten().fieldErrors });
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { device_token: deviceToken, email, user_agent, browser, install_source } = parsed.data;
    const userAgent = user_agent || req.headers.get("user-agent") || "";
    const ip = getClientIp(req);

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

    // Anti-flood: cap fresh org creations from a single IP in last 24h
    if (ip !== "unknown") {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("guard_devices")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since)
        .eq("install_source", `extension|ip:${ip}`);

      if ((count ?? 0) >= IP_DAILY_CAP) {
        log("IP daily cap exceeded", { ip, count });
        return new Response(
          JSON.stringify({ error: "Too many provisions from this network. Try again tomorrow." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
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

    // Stamp install_source with IP marker so the daily cap query above works
    const taggedSource = ip !== "unknown" ? `extension|ip:${ip}` : (install_source || "extension");

    const { error: devErr } = await supabase.from("guard_devices").insert({
      org_id: newOrg.id,
      device_token: deviceToken,
      email,
      user_agent: userAgent,
      browser: browser || "chrome",
      install_source: taggedSource,
    });

    if (devErr) {
      log("Device insert failed (non-fatal)", { error: devErr.message });
    }

    log("Provisioned new Guard org", { orgId: newOrg.id, ip });

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
