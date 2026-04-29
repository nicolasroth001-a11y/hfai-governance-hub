// LinkedIn Chrome extension API
// Endpoints (auth via X-Extension-Token header matching linkedin_session_state.extension_token):
//   POST /next       -> returns next pending lead (with linkedin_url) and active template
//   POST /update     -> { lead_id, status, message?, error? } updates lead + activity log
//   POST /personalize-> { lead_id, headline, template_body } returns AI-rewritten message
//   POST /heartbeat  -> resets daily counter if needed, returns session state

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-extension-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function fillTemplate(body: string, lead: any) {
  const firstName = (lead.contact_name || "").split(" ")[0] || "there";
  const fn = (lead.contact_title || "AI / governance").split(",")[0];
  return body
    .replaceAll("{firstName}", firstName)
    .replaceAll("{fullName}", lead.contact_name || "")
    .replaceAll("{company}", lead.company_name || "your company")
    .replaceAll("{title}", lead.contact_title || "")
    .replaceAll("{function}", fn)
    .replaceAll("{industry}", lead.industry || "");
}

async function authSession(supabase: any, token: string | null) {
  if (!token) return null;
  const { data } = await supabase
    .from("linkedin_session_state")
    .select("*")
    .eq("extension_token", token)
    .eq("active", true)
    .maybeSingle();
  if (!data) return null;
  // Reset daily counter if past day
  const today = new Date().toISOString().slice(0, 10);
  if (data.last_reset_date !== today) {
    await supabase
      .from("linkedin_session_state")
      .update({ sent_today: 0, last_reset_date: today })
      .eq("id", data.id);
    data.sent_today = 0;
    data.last_reset_date = today;
  }
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop() || "";
  const token = req.headers.get("x-extension-token");

  try {
    const session = await authSession(supabase, token);
    if (!session) return json({ error: "Invalid extension token" }, 401);

    if (path === "heartbeat") {
      return json({
        ok: true,
        sent_today: session.sent_today,
        daily_cap: session.daily_cap,
        remaining: Math.max(0, session.daily_cap - session.sent_today),
        min_delay_seconds: session.min_delay_seconds,
        max_delay_seconds: session.max_delay_seconds,
      });
    }

    if (path === "next") {
      if (session.sent_today >= session.daily_cap) {
        return json({ done: true, reason: "daily_cap_reached", sent_today: session.sent_today });
      }
      const { data: lead } = await supabase
        .from("leads")
        .select("*")
        .eq("linkedin_status", "pending")
        .neq("linkedin_url", "")
        .not("linkedin_url", "is", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!lead) return json({ done: true, reason: "no_leads" });

      const { data: tmpl } = await supabase
        .from("linkedin_templates")
        .select("*")
        .eq("is_default", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const templateBody = tmpl?.body || "Hi {firstName}, I'd love to connect.";
      const filled = fillTemplate(templateBody, lead);

      return json({
        lead,
        template: tmpl,
        message: filled,
        remaining: session.daily_cap - session.sent_today,
      });
    }

    if (path === "personalize") {
      const { lead_id, headline, template_body } = await req.json();
      const { data: lead } = await supabase.from("leads").select("*").eq("id", lead_id).maybeSingle();
      if (!lead) return json({ error: "Lead not found" }, 404);

      if (headline) {
        await supabase.from("leads").update({ linkedin_headline: headline }).eq("id", lead_id);
      }

      const baseFilled = fillTemplate(template_body || "", lead);
      const prompt = `You are writing a LinkedIn connection request (max 280 chars, no emojis, conversational, NOT salesy).

Prospect: ${lead.contact_name} — ${lead.contact_title} at ${lead.company_name} (${lead.industry || "unknown industry"})
Their LinkedIn headline/recent activity: "${headline || "(not provided)"}"

Base template (rewrite, keep core message but personalize ONE specific reference to their headline/role):
"${baseFilled}"

Output ONLY the final message text. No preamble. Max 280 chars. Hard rule: must mention HFAI or human oversight or EU AI Act once.`;

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!aiRes.ok) {
        const err = await aiRes.text();
        return json({ error: "AI failed", message: baseFilled, details: err }, 200);
      }
      const aiData = await aiRes.json();
      let msg = aiData.choices?.[0]?.message?.content?.trim() || baseFilled;
      msg = msg.replace(/^["']|["']$/g, "").slice(0, 290);

      return json({ message: msg, base: baseFilled });
    }

    if (path === "update") {
      const { lead_id, status, message, error } = await req.json();
      if (!lead_id || !status) return json({ error: "lead_id and status required" }, 400);

      const allowed = ["sent", "accepted", "replied", "skipped", "failed"];
      if (!allowed.includes(status)) return json({ error: "invalid status" }, 400);

      const update: Record<string, unknown> = { linkedin_status: status };
      if (message) update.linkedin_message = message;
      if (error) update.linkedin_last_error = error;
      if (status === "sent") update.linkedin_sent_at = new Date().toISOString();

      await supabase.from("leads").update(update).eq("id", lead_id);

      if (status === "sent") {
        await supabase
          .from("linkedin_session_state")
          .update({ sent_today: session.sent_today + 1 })
          .eq("id", session.id);
      }

      await supabase.from("linkedin_activity_log").insert({
        admin_id: session.admin_id,
        lead_id,
        action: status,
        status: error ? "error" : "ok",
        details: { message, error },
      });

      return json({ ok: true });
    }

    return json({ error: "Unknown endpoint" }, 404);
  } catch (e: any) {
    console.error(e);
    return json({ error: e.message || String(e) }, 500);
  }
});
