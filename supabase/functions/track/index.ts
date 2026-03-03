import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Sanitize & validate inputs
    const route = typeof body.route === "string" ? body.route.slice(0, 500) : null;
    const session_id = typeof body.session_id === "string" ? body.session_id.slice(0, 100) : null;
    const user_id = typeof body.user_id === "string" ? body.user_id.slice(0, 100) : null;
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 2000) : null;
    const user_agent = typeof body.user_agent === "string" ? body.user_agent.slice(0, 1000) : null;

    if (!route || !session_id) {
      return new Response(JSON.stringify({ error: "route and session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("analytics").insert({
      route,
      session_id,
      user_id,
      referrer,
      user_agent,
    });

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Failed to track" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Track error:", e);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
