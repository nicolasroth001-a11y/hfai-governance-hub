import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: hasAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!hasAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // GET subscriber count
    if (action === "get_stats") {
      const { count: activeCount } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: totalCount } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true });

      return new Response(
        JSON.stringify({ active: activeCount || 0, total: totalCount || 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SEND newsletter blast
    if (action === "send_blast") {
      const { subject, preheader, content, templateName } = body;

      if (!subject || !content) {
        return new Response(
          JSON.stringify({ error: "subject and content are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get all active subscribers
      const { data: subscribers, error: subError } = await supabase
        .from("newsletter_subscribers")
        .select("email")
        .eq("status", "active");

      if (subError) throw subError;
      if (!subscribers || subscribers.length === 0) {
        return new Response(
          JSON.stringify({ error: "No active subscribers" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const template = templateName || "newsletter-blast";
      const batchId = crypto.randomUUID();
      let queued = 0;

      // Send to each subscriber via transactional email system
      for (const sub of subscribers) {
        try {
          const { error } = await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: template,
              recipientEmail: sub.email,
              idempotencyKey: `blast-${batchId}-${sub.email}`,
              templateData: { subject, preheader, content },
            },
          });
          if (!error) queued++;
        } catch (e) {
          console.error(`Failed to queue for ${sub.email}:`, e);
        }
      }

      console.log(`Newsletter blast queued: ${queued}/${subscribers.length} emails`, { batchId, subject });

      return new Response(
        JSON.stringify({ success: true, queued, total: subscribers.length, batchId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Newsletter blast error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
