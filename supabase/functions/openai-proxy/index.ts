import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[AI-PROXY] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

// Provider-specific endpoint mapping
const PROVIDER_ENDPOINTS: Record<string, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
  google: "https://generativelanguage.googleapis.com/v1beta/chat/completions",
};

// Build provider-specific request headers
function buildProviderHeaders(provider: string, apiKey: string): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (provider === "anthropic") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  return headers;
}

// Transform request body for Anthropic format
function transformRequestForProvider(provider: string, body: any) {
  if (provider === "anthropic") {
    const { model, messages, max_tokens, ...rest } = body;
    // Extract system message
    const systemMsg = messages?.find((m: any) => m.role === "system");
    const nonSystemMsgs = messages?.filter((m: any) => m.role !== "system") || [];
    return {
      model,
      messages: nonSystemMsgs,
      max_tokens: max_tokens || 4096,
      ...(systemMsg ? { system: systemMsg.content } : {}),
      ...rest,
    };
  }
  return body;
}

// Normalize provider response to OpenAI format
function normalizeResponse(provider: string, data: any) {
  if (provider === "anthropic") {
    return {
      id: data.id,
      object: "chat.completion",
      model: data.model,
      choices: [{
        index: 0,
        message: { role: "assistant", content: data.content?.[0]?.text || "" },
        finish_reason: data.stop_reason === "end_turn" ? "stop" : data.stop_reason,
      }],
      usage: data.usage ? {
        prompt_tokens: data.usage.input_tokens,
        completion_tokens: data.usage.output_tokens,
        total_tokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
      } : null,
    };
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Request received", { method: req.method, url: req.url });

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

    let provider: any;

    if (proxyToken) {
      const { data, error } = await supabase
        .from("connected_providers")
        .select("*, organizations(id, name, api_key)")
        .eq("proxy_token", proxyToken)
        .eq("status", "active")
        .single();

      if (error || !data) throw new Error("Invalid proxy token");
      provider = data;
    } else {
      const token = authHeader!.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      if (!userData.user) throw new Error("Invalid auth token");

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", userData.user.id)
        .single();

      if (!profile?.org_id) throw new Error("No organization found");

      // Get any active provider for this org
      const { data, error } = await supabase
        .from("connected_providers")
        .select("*, organizations(id, name, api_key)")
        .eq("org_id", profile.org_id)
        .eq("status", "active")
        .limit(1)
        .single();

      if (error || !data) throw new Error("No AI provider configured");
      provider = data;
    }

    const providerName = provider.provider || "openai";
    logStep("Provider found", { org_id: provider.org_id, provider: providerName });

    const body = await req.json();
    const { model, messages, ...rest } = body;

    const inputText = messages?.map((m: any) => `${m.role}: ${m.content}`).join("\n") || "";

    // Determine endpoint
    const endpoint = provider.base_url || PROVIDER_ENDPOINTS[providerName] || PROVIDER_ENDPOINTS.openai;
    const requestHeaders = buildProviderHeaders(providerName, provider.api_key_encrypted);
    const transformedBody = transformRequestForProvider(providerName, { model, messages, ...rest });

    logStep("Forwarding to provider", { url: endpoint, model, provider: providerName });

    const providerResponse = await fetch(endpoint, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(transformedBody),
    });

    const rawData = await providerResponse.json();

    if (!providerResponse.ok) {
      logStep("Provider error", { status: providerResponse.status, error: rawData });
      return new Response(JSON.stringify(rawData), {
        status: providerResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize to OpenAI format
    const normalizedData = normalizeResponse(providerName, rawData);
    const outputText = normalizedData.choices?.[0]?.message?.content || "";

    // Log as AI event
    const { error: eventError } = await supabase.from("ai_events").insert({
      org_id: provider.org_id,
      event_type: "chat_completion",
      input_text: inputText.substring(0, 5000),
      output_text: outputText.substring(0, 5000),
      ai_system_id: null,
      metadata: {
        model,
        provider: providerName,
        source: "proxy",
        usage: normalizedData.usage || null,
      },
      payload: {
        request: { model, message_count: messages?.length || 0 },
        response: {
          id: normalizedData.id,
          finish_reason: normalizedData.choices?.[0]?.finish_reason,
          usage: normalizedData.usage,
        },
      },
    });

    if (eventError) {
      logStep("Event logging failed", { error: eventError.message });
    } else {
      logStep("Event logged successfully");
    }

    // Fire-and-forget rule evaluation
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
          metadata: { model, provider: providerName, source: "proxy" },
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    return new Response(JSON.stringify(normalizedData), {
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
