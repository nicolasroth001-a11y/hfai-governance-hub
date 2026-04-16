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

    // Verify caller is a customer (org admin)
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role, org_id")
      .eq("id", user.id)
      .single();

    if (!callerProfile || callerProfile.role !== "customer" || !callerProfile.org_id) {
      return new Response(JSON.stringify({ error: "Only customer admins can create in-house reviewers" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new Response(JSON.stringify({ error: "Email, name, and password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the reviewer auth user — the handle_new_user trigger will create profile + user_roles
    // BUT it won't set org_id for reviewers, so we fix that after
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "reviewer" },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reviewerId = newUser.user.id;
    const orgId = callerProfile.org_id;

    // Update the reviewer's profile to link to the customer's org
    await supabaseAdmin
      .from("profiles")
      .update({ org_id: orgId })
      .eq("id", reviewerId);

    // Create reviewer_permissions entry as company_assigned
    await supabaseAdmin
      .from("reviewer_permissions")
      .insert({
        org_id: orgId,
        reviewer_id: reviewerId,
        reviewer_type: "company_assigned",
        can_review_violations: true,
        can_manage_rules: false,
        can_manage_systems: false,
        can_approve_deployments: false,
        can_override_decisions: false,
        is_backup_reviewer: false,
      });

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      action: "in_house_reviewer_created",
      entity_type: "user",
      entity_id: reviewerId,
      details: `In-house reviewer "${name}" (${email}) created by customer admin`,
      user_id: user.id,
      org_id: orgId,
    });

    return new Response(JSON.stringify({
      success: true,
      reviewer: { id: reviewerId, email, name, role: "reviewer" },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
