import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, author_name, submitter_email } = await req.json();

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("CONTACT_EMAIL");

    if (!resendKey || !adminEmail) {
      console.log("[NOTIFY-BLOG] Missing RESEND_API_KEY or CONTACT_EMAIL");
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const submittedAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">📝 New Blog Post Submission</h1>
        </div>
        <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; width: 120px;">Title</td><td style="padding: 8px 0; font-weight: 600;">${title || "Untitled"}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Author</td><td style="padding: 8px 0;">${author_name || "Unknown"}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;"><a href="mailto:${submitter_email}">${submitter_email || "Not provided"}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Submitted</td><td style="padding: 8px 0;">${submittedAt}</td></tr>
          </table>
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 13px; margin: 0;">Log in to your admin panel to review and approve or reject this submission.</p>
          </div>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "HFAI <onboarding@resend.dev>",
        to: [adminEmail],
        reply_to: submitter_email,
        subject: `📝 Blog submission: "${title}" by ${author_name}`,
        html,
      }),
    });

    const result = await res.json();
    console.log("[NOTIFY-BLOG] Email sent", { status: res.status, result });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[NOTIFY-BLOG] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
