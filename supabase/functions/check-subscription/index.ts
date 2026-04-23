import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_KEY") || Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    const unauthenticatedResponse = () =>
      new Response(JSON.stringify({ subscribed: false, on_trial: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    if (!authHeader) {
      logStep("No auth header — returning unsubscribed");
      return unauthenticatedResponse();
    }

    const token = authHeader.replace("Bearer ", "");

    // Use anon key client with auth header for ES256 compatibility
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      logStep("No valid session — returning unsubscribed", { error: userError?.message });
      return unauthenticatedResponse();
    }
    const user = userData.user;
    logStep("User authenticated", { email: user.email });

    // Grant full Enterprise access to test account
    const TEST_EMAILS = ["customer@hfai.io"];
    if (TEST_EMAILS.includes(user.email)) {
      logStep("Test account — granting full Enterprise access");
      return new Response(JSON.stringify({
        subscribed: true,
        on_trial: false,
        product_id: "prod_U83jB97VVesTcg", // Enterprise product
        subscription_end: new Date(Date.now() + 365 * 86400000).toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false, on_trial: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const trialSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 1,
    });

    const allSubs = [...subscriptions.data, ...trialSubs.data];
    const hasAccess = allSubs.length > 0;
    let subscriptionEnd = null;
    let onTrial = false;
    let productId = null;

    if (hasAccess) {
      const sub = allSubs[0];
      subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      onTrial = sub.status === "trialing";
      productId = sub.items.data[0].price.product;
      logStep("Subscription found", { status: sub.status, onTrial, endDate: subscriptionEnd });
    }

    return new Response(JSON.stringify({
      subscribed: hasAccess,
      on_trial: onTrial,
      product_id: productId,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
