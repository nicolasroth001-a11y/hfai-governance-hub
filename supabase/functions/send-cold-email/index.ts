import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Daily send cap to protect domain reputation. Override with COLD_EMAIL_DAILY_CAP env var.
const DEFAULT_DAILY_CAP = 50;

const SITE_URL = "https://hfa-i.org";

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

    const { lead_id, subject_override, body_override, recipient_override, is_test } = await req.json();
    if (!lead_id) return new Response(JSON.stringify({ error: "lead_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Service-role client for server-side operations (suppression check, cap check, token mgmt)
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ---------- Daily send cap (skipped for test sends) ----------
    const cap = parseInt(Deno.env.get("COLD_EMAIL_DAILY_CAP") ?? "") || DEFAULT_DAILY_CAP;
    let sentToday = 0;
    if (!is_test) {
      const since = new Date();
      since.setUTCHours(0, 0, 0, 0);
      const { count, error: countErr } = await admin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("sent_at", since.toISOString());
      if (countErr) console.error("daily cap count error:", countErr);
      sentToday = count ?? 0;
      if (sentToday >= cap) {
        return new Response(
          JSON.stringify({ error: `Daily send cap reached (${sentToday}/${cap}). Try again tomorrow or raise COLD_EMAIL_DAILY_CAP.` }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const { data: lead, error: leadErr } = await admin.from("leads").select("*").eq("id", lead_id).single();
    if (leadErr || !lead) throw new Error("Lead not found");

    const rawTo = is_test && recipient_override ? recipient_override : (lead.contact_email ?? "");
    const to = rawTo.trim().toLowerCase();
    const subject = ((is_test ? "[TEST] " : "") + (subject_override ?? lead.email_subject ?? "")).trim();
    const body = (body_override ?? lead.email_body ?? "").trim();

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("Invalid recipient email");
    if (!subject || !body) throw new Error("Subject and body required");

    // ---------- Suppression check ----------
    // ---------- Suppression check (skipped for test sends) ----------
    if (!is_test) {
      const { data: suppressed } = await admin
        .from("suppressed_emails")
        .select("email")
        .eq("email", to)
        .maybeSingle();
      if (suppressed) {
        await admin.from("leads").update({ status: "suppressed", notes: (lead.notes ? lead.notes + "\n" : "") + "Recipient on suppression list — not sent." }).eq("id", lead_id);
        return new Response(
          JSON.stringify({ error: "Recipient is on the suppression list. Lead marked as suppressed." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ---------- Get or create unsubscribe token ----------
    let unsubToken: string | null = null;
    const { data: existingTok } = await admin
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", to)
      .is("used_at", null)
      .maybeSingle();
    if (existingTok?.token) {
      unsubToken = existingTok.token;
    } else {
      const newToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      const { data: inserted, error: tokErr } = await admin
        .from("email_unsubscribe_tokens")
        .insert({ email: to, token: newToken })
        .select("token")
        .single();
      if (tokErr) throw new Error(`Failed to create unsubscribe token: ${tokErr.message}`);
      unsubToken = inserted.token;
    }

    const unsubUrl = `${SITE_URL}/unsubscribe?token=${unsubToken}`;

    const fromEmail = Deno.env.get("CONTACT_EMAIL");
    const password = Deno.env.get("CONTACT_EMAIL_APP_PASSWORD");
    if (!fromEmail || !password) throw new Error("Zoho SMTP credentials not configured");

    // ---------- Compose with footer ----------
    const footerText = `\n\n—\nIf you'd rather not hear from me, just reply STOP and I won't email again. You can also opt out here: ${unsubUrl}`;
    const fullText = body + footerText;

    const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const htmlBody = body.split("\n").map((l: string) => escape(l)).join("<br>");
    const htmlFooter = `<p style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;line-height:1.5;">If you'd rather not hear from me, just reply <strong>STOP</strong> and I won't email again. You can also <a href="${unsubUrl}" style="color:#6b7280;">opt out here</a>.</p>`;

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.zoho.com",
        port: 465,
        tls: true,
        auth: { username: fromEmail, password },
      },
    });

    try {
      await client.send({
        from: `Nicolas Roth <${fromEmail}>`,
        to,
        subject,
        content: fullText,
        html: `<div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;">${htmlBody}${htmlFooter}</div>`,
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>, <mailto:${fromEmail}?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
    } finally {
      client.close().catch((closeError) => console.error("send-cold-email close error:", closeError));
    }

    if (is_test) {
      return new Response(
        JSON.stringify({ success: true, test: true, recipient: to, lead, sent_today: sentToday, daily_cap: cap }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: updated, error: updErr } = await admin
      .from("leads")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", lead_id)
      .select()
      .single();
    if (updErr) throw updErr;

    return new Response(
      JSON.stringify({ success: true, lead: updated, sent_today: sentToday + 1, daily_cap: cap }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-cold-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
