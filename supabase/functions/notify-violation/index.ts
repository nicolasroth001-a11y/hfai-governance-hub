import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { violation_id, trigger_type } = await req.json();

    if (!violation_id) {
      return new Response(JSON.stringify({ error: "violation_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey) {
      console.error("Missing RESEND_API_KEY");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const isTest = violation_id === "test";
    let violation: any;
    let orgId: string;

    if (isTest) {
      // For test notifications, get org_id from the authenticated user
      const authHeader = req.headers.get("Authorization");
      const token = authHeader?.replace("Bearer ", "") || "";
      const { data: userData } = await supabase.auth.getUser(token);
      if (!userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", userData.user.id)
        .single();
      if (!profile?.org_id) {
        return new Response(JSON.stringify({ error: "No organization found" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      orgId = profile.org_id;
      violation = {
        id: "test",
        org_id: orgId,
        severity: "high",
        status: "open",
        description: "This is a test notification from HFAI to verify your email alert configuration is working correctly.",
        detected_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    } else {
      // Fetch real violation
      const { data: vData, error: vErr } = await supabase
        .from("violations")
        .select("*")
        .eq("id", violation_id)
        .single();

      if (vErr || !vData) {
        return new Response(JSON.stringify({ error: "Violation not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      violation = vData;
      orgId = violation.org_id;
    }

    // Fetch org notification preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("org_id", orgId)
      .single();

    // If no prefs exist or email disabled, skip
    if (!prefs || !prefs.email_enabled) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Email notifications disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check trigger type against preferences
    const effectiveTrigger = trigger_type || "new_violation";
    if (effectiveTrigger === "new_violation" && !prefs.notify_all_violations) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "All-violation notifications disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (effectiveTrigger === "high_severity" && !prefs.notify_high_severity) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "High severity notifications disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (effectiveTrigger === "pattern_detected" && !prefs.notify_patterns) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Pattern notifications disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine recipients
    let recipients = prefs.email_recipients || [];
    if (recipients.length === 0) {
      // Fallback: get org contact email
      const { data: org } = await supabase
        .from("organizations")
        .select("contact_email")
        .eq("id", orgId)
        .single();
      if (org?.contact_email) recipients = [org.contact_email];
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "No recipients configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email
    const severityEmoji =
      violation.severity === "critical" ? "🔴" :
      violation.severity === "high" ? "🟠" :
      violation.severity === "medium" ? "🟡" : "🟢";

    const subject =
      effectiveTrigger === "pattern_detected"
        ? `⚠️ Recurring violation pattern detected`
        : `${severityEmoji} ${(violation.severity || "medium").toUpperCase()} Violation Detected`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px;">
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">
            ${severityEmoji} HFAI Violation Alert
          </h1>
          <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">
            ${effectiveTrigger === "pattern_detected" ? "Recurring pattern detected" : "New violation requires attention"}
          </p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 120px;">Severity</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 13px; color: #0f172a;">
                ${severityEmoji} ${(violation.severity || "medium").toUpperCase()}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Status</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 13px; color: #0f172a;">
                ${(violation.status || "open").toUpperCase()}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Detected</td>
              <td style="padding: 8px 0; font-size: 13px; color: #0f172a;">
                ${new Date(violation.detected_at || violation.created_at).toLocaleString()}
              </td>
            </tr>
          </table>
        </div>

        ${violation.description ? `
        <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
          <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.5;">
            ${violation.description}
          </p>
        </div>
        ` : ""}

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
          HFAI — Human-First AI Governance Platform
        </p>
      </div>
    `;

    // Send via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HFAI Alerts <alerts@notify.hfa-i.org>",
        to: recipients,
        subject,
        html: htmlBody,
      }),
    });

    const emailStatus = emailRes.ok ? "sent" : "failed";
    const emailError = emailRes.ok ? null : await emailRes.text();

    if (!emailRes.ok) {
      console.error("Resend error:", emailError);
    }

    // Log notification
    await supabase.from("notification_logs").insert({
      org_id: orgId,
      violation_id: isTest ? null : violation.id,
      channel: "email",
      recipients,
      subject,
      status: emailStatus,
      error: emailError,
    });

    return new Response(
      JSON.stringify({ success: emailRes.ok, status: emailStatus, recipients: recipients.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("notify-violation error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
