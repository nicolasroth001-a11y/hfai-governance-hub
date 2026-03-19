import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[OPENAI-PROXY] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Request received", { method: req.method, url: req.url });

    // Auth via proxy token (x-api-key header) OR Bearer token
    const proxyToken = req.headers.get("x-api-key");
    const authHeader = req.headers.get("authorization");

    if (!proxyToken && !authHeader) {
      throw new Error("Missing authentication: provide x-api-key (proxy token) or Authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Look up the connected provider by proxy token or user auth
    let provider: any;

    if (proxyToken) {
      const { data, error } = await supabase
        .from("connected_providers")
        .select("*, organizations(id, name)")
        .eq("proxy_token", proxyToken)
        .eq("status", "active")
        .single();

      if (error || !data) {
        throw new Error("Invalid proxy token");
      }
      provider = data;
    } else {
      // Bearer token auth — look up user's org provider
      const token = authHeader!.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      if (!userData.user) throw new Error("Invalid auth token");

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", userData.user.id)
        .single();

      if (!profile?.org_id) throw new Error("No organization found");

      const { data, error } = await supabase
        .from("connected_providers")
        .select("*, organizations(id, name)")
        .eq("org_id", profile.org_id)
        .eq("provider", "openai")
        .eq("status", "active")
        .single();

      if (error || !data) throw new Error("No OpenAI provider configured");
      provider = data;
    }

    logStep("Provider found", { org_id: provider.org_id, provider: provider.provider });

    // Parse the request body
    const body = await req.json();
    const { model, messages, ...rest } = body;

    // Extract input/output for logging
    const inputText = messages?.map((m: any) => `${m.role}: ${m.content}`).join("\n") || "";

    // Forward to OpenAI
    const openaiUrl = `${provider.base_url || "https://api.openai.com/v1"}/chat/completions`;
    logStep("Forwarding to OpenAI", { url: openaiUrl, model });

    const openaiResponse = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${provider.api_key_encrypted}`,
      },
      body: JSON.stringify({ model, messages, ...rest }),
    });

    const openaiData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      logStep("OpenAI error", { status: openaiResponse.status, error: openaiData });
      return new Response(JSON.stringify(openaiData), {
        status: openaiResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const outputText = openaiData.choices?.[0]?.message?.content || "";

    // Log as an AI event in HFAI
    const { error: eventError } = await supabase.from("ai_events").insert({
      org_id: provider.org_id,
      event_type: "chat_completion",
      input_text: inputText.substring(0, 5000),
      output_text: outputText.substring(0, 5000),
      ai_system_id: null,
      metadata: {
        model,
        provider: "openai",
        source: "proxy",
        usage: openaiData.usage || null,
      },
      payload: {
        request: { model, message_count: messages?.length || 0 },
        response: {
          id: openaiData.id,
          finish_reason: openaiData.choices?.[0]?.finish_reason,
          usage: openaiData.usage,
        },
      },
    });

    if (eventError) {
      logStep("Event logging failed", { error: eventError.message });
    } else {
      logStep("Event logged successfully");
    }

    // Now trigger rule evaluation via the ingest-event function
    // (fire-and-forget to not slow down the response)
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      fetch(`${supabaseUrl}/functions/v1/ingest-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
          "x-api-key": provider.organizations?.api_key || "",
        },
        body: JSON.stringify({
          event_type: "chat_completion",
          input_text: inputText.substring(0, 2000),
          output_text: outputText.substring(0, 2000),
          metadata: { model, provider: "openai", source: "proxy" },
        }),
      }).catch(() => {}); // fire-and-forget
    } catch {
      // ignore
    }

    // Return the OpenAI response unchanged
    return new Response(JSON.stringify(openaiData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: { message: msg, type: "proxy_error" } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }
});
