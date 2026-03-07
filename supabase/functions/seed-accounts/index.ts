import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const accounts = [
    { email: "admin@hfai.io", password: "Admin123!", role: "admin", name: "HFAI Admin" },
    { email: "reviewer@hfai.io", password: "Reviewer123!", role: "reviewer", name: "HFAI Reviewer" },
    { email: "customer@hfai.io", password: "Customer123!", role: "customer", name: "HFAI Customer" },
  ];

  const results = [];

  for (const account of accounts) {
    // Check if user already exists by trying to sign in
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u: any) => u.email === account.email);
    
    if (existing) {
      // Update password and ensure profile is correct
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: account.password,
        email_confirm: true,
      });
      
      // Ensure profile exists with correct role
      await supabaseAdmin.from("profiles").upsert({
        id: existing.id,
        email: account.email,
        name: account.name,
        role: account.role,
      }, { onConflict: "id" });

      // Ensure user_roles entry
      await supabaseAdmin.from("user_roles").upsert({
        user_id: existing.id,
        role: account.role,
      }, { onConflict: "user_id,role" });

      results.push({ email: account.email, status: "updated", role: account.role });
      continue;
    }

    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        name: account.name,
        role: account.role,
      },
    });

    if (createError) {
      results.push({ email: account.email, status: "error", error: createError.message });
      continue;
    }

    // If the trigger didn't create the org for customer, create one
    if (account.role === "customer" && newUser.user) {
      const { data: org } = await supabaseAdmin.from("organizations").insert({
        name: "HFAI Test Corp",
        contact_email: account.email,
      }).select().single();

      if (org) {
        await supabaseAdmin.from("profiles").update({ org_id: org.id }).eq("id", newUser.user.id);
      }
    }

    results.push({ email: account.email, status: "created", role: account.role });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
