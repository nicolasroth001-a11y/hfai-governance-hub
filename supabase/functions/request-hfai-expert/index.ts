import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get caller profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, org_id, name, email")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "customer" || !profile.org_id) {
      return new Response(JSON.stringify({ error: "Customer admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get org info
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("name, contact_email")
      .eq("id", profile.org_id)
      .single();

    // Notify HFAI admin via email
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("CONTACT_EMAIL") || "nicolasroth001@gmail.com";

    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "HFAI Platform <noreply@notify.hfa-i.org>",
          to: [adminEmail],
          subject: `🔔 HFAI Expert Reviewer Requested — ${org?.name || "Unknown Org"}`,
          html: `
            <h2>HFAI Expert Reviewer Request</h2>
            <p><strong>Organization:</strong> ${org?.name || "Unknown"}</p>
            <p><strong>Requested by:</strong> ${profile.name} (${profile.email})</p>
            <p><strong>Org Contact:</strong> ${org?.contact_email || "N/A"}</p>
            <p><strong>Org ID:</strong> ${profile.org_id}</p>
            <p>Please assign an HFAI Expert Reviewer to this organization through the Admin portal.</p>
          `,
        }),
      });
    }

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      action: "hfai_expert_requested",
      entity_type: "organization",
      entity_id: profile.org_id,
      details: `HFAI Expert Reviewer requested by ${profile.name} (${profile.email}) for org "${org?.name}"`,
      user_id: user.id,
      org_id: profile.org_id,
    });

    return new Response(JSON.stringify({ success: true, message: "HFAI Expert request submitted. Our team will be in touch shortly." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
