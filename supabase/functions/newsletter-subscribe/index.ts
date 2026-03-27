import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  email: z.string().email().max(255),
  gdpr_consent: z.boolean().refine((v) => v === true, {
    message: "GDPR consent is required",
  }),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing && existing.status === "active") {
      // Already subscribed — return success silently
      return new Response(
        JSON.stringify({ success: true, already_subscribed: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existing && existing.status === "unsubscribed") {
      // Re-subscribe
      await supabase
        .from("newsletter_subscribers")
        .update({ status: "active", unsubscribed_at: null, gdpr_consent: true })
        .eq("id", existing.id);
    } else {
      // New subscriber
      await supabase
        .from("newsletter_subscribers")
        .insert({ email: normalizedEmail, gdpr_consent: true });
    }

    // Send welcome email via transactional email system
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "newsletter-welcome",
        recipientEmail: normalizedEmail,
        idempotencyKey: `newsletter-welcome-${normalizedEmail}`,
      },
    });

    console.log("Newsletter subscriber added and welcome email sent", { email: normalizedEmail });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Newsletter signup error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
