import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userData.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { lead_id, subject_override, body_override } = await req.json();
    if (!lead_id) return new Response(JSON.stringify({ error: "lead_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: lead, error: leadErr } = await supabase.from("leads").select("*").eq("id", lead_id).single();
    if (leadErr || !lead) throw new Error("Lead not found");

    const to = lead.contact_email;
    const subject = (subject_override ?? lead.email_subject ?? "").trim();
    const body = (body_override ?? lead.email_body ?? "").trim();

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("Invalid recipient email");
    if (!subject || !body) throw new Error("Subject and body required");

    const fromEmail = Deno.env.get("CONTACT_EMAIL");
    const password = Deno.env.get("CONTACT_EMAIL_APP_PASSWORD");
    if (!fromEmail || !password) throw new Error("Zoho SMTP credentials not configured");

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.zoho.com",
        port: 465,
        tls: true,
        auth: { username: fromEmail, password },
      },
    });

    const htmlBody = body.split("\n").map((l: string) => l.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")).join("<br>");

    await client.send({
      from: `Nicolas Roth <${fromEmail}>`,
      to,
      subject,
      content: body,
      html: `<div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;">${htmlBody}</div>`,
    });
    await client.close();

    const { data: updated, error: updErr } = await supabase
      .from("leads")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", lead_id)
      .select()
      .single();
    if (updErr) throw updErr;

    return new Response(JSON.stringify({ success: true, lead: updated }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("send-cold-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
