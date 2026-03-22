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
    const { email, name, company_name, role } = await req.json();

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("CONTACT_EMAIL");

    if (!resendKey || !adminEmail) {
      console.log("[NOTIFY-SIGNUP] Missing RESEND_API_KEY or CONTACT_EMAIL");
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const roleLabel = role || "customer";
    const displayName = name || "Unknown";
    const company = company_name || "Not provided";
    const signupTime = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">🎉 New Signup on HFAI</h1>
        </div>
        <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; width: 120px;">Email</td><td style="padding: 8px 0; font-weight: 600;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Name</td><td style="padding: 8px 0;">${displayName}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Company</td><td style="padding: 8px 0;">${company}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Role</td><td style="padding: 8px 0;"><span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${roleLabel}</span></td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Time</td><td style="padding: 8px 0;">${signupTime}</td></tr>
          </table>
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
        subject: `New ${roleLabel} signup: ${email}`,
        html,
      }),
    });

    const result = await res.json();
    console.log("[NOTIFY-SIGNUP] Email sent", { status: res.status, result });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[NOTIFY-SIGNUP] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
