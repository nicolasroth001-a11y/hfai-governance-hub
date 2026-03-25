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
    const { email, name, company_name, role, signup_source, signup_timestamp } = await req.json();

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
    const source = signup_source || "direct";
    const signupTime = signup_timestamp
      ? new Date(signup_timestamp).toLocaleString("en-US", { timeZone: "America/New_York" })
      : new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

    // Determine source label
    const sourceLabels: Record<string, string> = {
      customer_signup_page: "🔵 Direct Signup Page (/signup/customer)",
      pilot_signup_page: "🟢 Pilot Signup Page (/pilot)",
      direct: "⚪ Direct / Unknown",
    };
    const sourceDisplay = sourceLabels[source] || source;

    // Detect email domain for company intelligence
    const emailDomain = email?.split("@")[1] || "unknown";
    const isPersonalEmail = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "protonmail.com", "aol.com"].includes(emailDomain);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">🎉 New Signup on HFAI</h1>
          <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8;">${sourceDisplay}</p>
        </div>
        <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; width: 130px; font-size: 13px;">Email</td>
              <td style="padding: 10px 0; font-weight: 600; font-size: 14px;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Name</td>
              <td style="padding: 10px 0; font-size: 14px;">${displayName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Company</td>
              <td style="padding: 10px 0; font-size: 14px;">${company}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Email Domain</td>
              <td style="padding: 10px 0; font-size: 14px;">
                ${emailDomain}
                ${isPersonalEmail ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 6px;">Personal</span>' : '<span style="background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 6px;">Business</span>'}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Role</td>
              <td style="padding: 10px 0;">
                <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${roleLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Signup Source</td>
              <td style="padding: 10px 0; font-size: 14px;">${sourceDisplay}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Time (ET)</td>
              <td style="padding: 10px 0; font-size: 14px;">${signupTime}</td>
            </tr>
          </table>
          <div style="margin-top: 16px; padding: 12px; background: #f1f5f9; border-radius: 8px;">
            <p style="margin: 0; font-size: 12px; color: #475569;">
              <strong>Quick Actions:</strong> View this customer in your 
              <a href="https://hfa-i.org/admin/customers" style="color: #3b82f6;">Admin Dashboard</a>
            </p>
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
        subject: `🎯 New ${roleLabel} signup: ${displayName} (${company}) via ${source}`,
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
