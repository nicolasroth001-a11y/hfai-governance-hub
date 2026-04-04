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

function transformRequestForProvider(provider: string, body: any) {
  if (provider === "anthropic") {
    const { model, messages, max_tokens, ...rest } = body;
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

// ── Pre-flight governance check (synchronous, before forwarding to provider) ──
async function evaluateGovernanceRules(
  supabase: any,
  orgId: string,
  inputText: string
): Promise<{ blocked: boolean; blockedRules: any[]; violations: any[] }> {
  const { data: rules } = await supabase
    .from("rules")
    .select("*")
    .or(`org_id.eq.${orgId},org_id.is.null`)
    .eq("enabled", true);

  if (!rules || rules.length === 0) {
    return { blocked: false, blockedRules: [], violations: [] };
  }

  // Only check rules that can block (enforcement_mode = 'block' or 'warn')
  const enforcementRules = rules.filter((r: any) =>
    r.enforcement_mode === "block" || r.enforcement_mode === "warn"
  );

  if (enforcementRules.length === 0) {
    return { blocked: false, blockedRules: [], violations: [] };
  }

  const matchedRules: any[] = [];

  // Phase 1: Fast keyword pre-filter (< 1ms)
  for (const rule of enforcementRules) {
    if (rule.condition) {
      try {
        const condStr = typeof rule.condition === "string" ? rule.condition : JSON.stringify(rule.condition);
        const keywords = condStr.toLowerCase().split(/[,\s]+/).filter(Boolean);
        const lowerInput = inputText.toLowerCase();
        if (keywords.some((kw: string) => kw.length > 2 && lowerInput.includes(kw))) {
          matchedRules.push(rule);
        }
      } catch { /* skip */ }
    }
  }

  // Phase 2: AI classification only if no keyword matches but enforcement rules exist
  if (matchedRules.length === 0 && inputText.length > 10) {
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (lovableApiKey) {
      try {
        const ruleDescriptions = enforcementRules.map((r: any) =>
          `- ${r.id}: ${r.name} — ${r.description || "No description"} (severity: ${r.severity})`
        ).join("\n");

        const classifyRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: `You are an AI governance rule evaluator. Given user input text and a list of rules, determine which rules (if any) are violated. Reply ONLY with a JSON array of violated rule IDs, e.g. ["id1","id2"]. If none are violated, reply [].`,
              },
              {
                role: "user",
                content: `RULES:\n${ruleDescriptions}\n\nTEXT TO EVALUATE:\n${inputText.slice(0, 2000)}`,
              },
            ],
            max_tokens: 128,
            temperature: 0.1,
          }),
        });

        if (classifyRes.ok) {
          const classifyData = await classifyRes.json();
          const raw = classifyData.choices?.[0]?.message?.content || "[]";
          const match = raw.match(/\[.*?\]/s);
          if (match) {
            const parsed = JSON.parse(match[0]);
            for (const id of parsed) {
              const rule = enforcementRules.find((r: any) => r.id === id);
              if (rule && !matchedRules.includes(rule)) {
                matchedRules.push(rule);
              }
            }
          }
        }
      } catch (e) {
        logStep("AI classification failed in pre-flight", { error: String(e) });
      }
    }
  }

  if (matchedRules.length === 0) {
    return { blocked: false, blockedRules: [], violations: [] };
  }

  // Create violations and determine if we should block
  const blockedRules: any[] = [];
  const violations: any[] = [];

  for (const rule of matchedRules) {
    const enforcementMode = rule.enforcement_mode || "monitor";

    const { data: violation } = await supabase
      .from("violations")
      .insert({
        rule_id: rule.id,
        description: `Rule violated: ${rule.name} – ${rule.description || ""} [proxy pre-flight, enforcement: ${enforcementMode}]`,
        severity: rule.severity || "medium",
        org_id: orgId,
      })
      .select()
      .single();

    if (violation) {
      violations.push(violation);
      await supabase.from("audit_logs").insert({
        action: enforcementMode === "block" ? "violation_blocked" : "violation_warned",
        entity_type: "violation",
        entity_id: violation.id,
        details: `Proxy pre-flight (${enforcementMode}): ${rule.name}`,
        org_id: orgId,
      });
    }

    if (enforcementMode === "block") {
      blockedRules.push({
        ruleId: rule.id,
        ruleName: rule.name,
        description: rule.description || "This content violates our governance policy.",
        severity: rule.severity || "medium",
      });
    }
  }

  return {
    blocked: blockedRules.length > 0,
    blockedRules,
    violations,
  };
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

    // ── GOVERNANCE PRE-FLIGHT: Evaluate rules BEFORE forwarding to AI provider ──
    const governance = await evaluateGovernanceRules(supabase, provider.org_id, inputText);

    if (governance.blocked) {
      logStep("REQUEST BLOCKED by governance rules", {
        rules: governance.blockedRules.map((r: any) => r.ruleName),
      });

      const explanations = governance.blockedRules.map((r: any) =>
        `• ${r.ruleName}: ${r.description}`
      ).join("\n");

      // Return in OpenAI-compatible format so the customer's app handles it gracefully
      return new Response(JSON.stringify({
        id: `blocked-${crypto.randomUUID()}`,
        object: "chat.completion",
        model: model || "governance-blocked",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: `⚠️ This request was blocked by your organization's AI governance policy.\n\nThe following rules were triggered:\n${explanations}\n\nPlease modify your request to comply with your organization's guidelines. If you believe this was flagged in error, contact your compliance team for review.`,
          },
          finish_reason: "content_filter",
        }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        governance: {
          blocked: true,
          blocked_rules: governance.blockedRules,
          violations: governance.violations.map((v: any) => v.id),
        },
      }), {
        status: 200, // 200 so SDKs don't throw — the content explains the block
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log any warnings (non-blocking violations)
    if (governance.violations.length > 0) {
      logStep("Governance warnings (non-blocking)", {
        count: governance.violations.length,
      });
    }

    // ── Forward to AI provider (safe content) ──
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

    // ── POST-FLIGHT: Also evaluate the AI output for violations ──
    const outputGovernance = await evaluateGovernanceRules(supabase, provider.org_id, outputText);

    if (outputGovernance.blocked) {
      logStep("AI OUTPUT BLOCKED by governance rules", {
        rules: outputGovernance.blockedRules.map((r: any) => r.ruleName),
      });

      const explanations = outputGovernance.blockedRules.map((r: any) =>
        `• ${r.ruleName}: ${r.description}`
      ).join("\n");

      // Log the original event even though output was blocked
      await supabase.from("ai_events").insert({
        org_id: provider.org_id,
        event_type: "chat_completion_blocked",
        input_text: inputText.substring(0, 5000),
        output_text: `[BLOCKED] ${outputText.substring(0, 4990)}`,
        ai_system_id: null,
        metadata: { model, provider: providerName, source: "proxy", blocked: true },
        payload: { blocked_rules: outputGovernance.blockedRules },
      });

      return new Response(JSON.stringify({
        id: `blocked-${crypto.randomUUID()}`,
        object: "chat.completion",
        model: model || "governance-blocked",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: `⚠️ The AI's response was blocked by your organization's governance policy.\n\nThe following rules were triggered:\n${explanations}\n\nThe original response has been logged for audit purposes but was not delivered. Please contact your compliance team if you need further assistance.`,
          },
          finish_reason: "content_filter",
        }],
        usage: normalizedData.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        governance: {
          blocked: true,
          blocked_rules: outputGovernance.blockedRules,
          violations: outputGovernance.violations.map((v: any) => v.id),
        },
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log as AI event (safe content passed through)
    const governanceMetadata: any = {
      model,
      provider: providerName,
      source: "proxy",
      usage: normalizedData.usage || null,
    };

    // Include warning info if any warn-mode rules matched
    if (governance.violations.length > 0 || outputGovernance.violations.length > 0) {
      governanceMetadata.governance_warnings = [
        ...governance.violations.map((v: any) => v.id),
        ...outputGovernance.violations.map((v: any) => v.id),
      ];
    }

    const { error: eventError } = await supabase.from("ai_events").insert({
      org_id: provider.org_id,
      event_type: "chat_completion",
      input_text: inputText.substring(0, 5000),
      output_text: outputText.substring(0, 5000),
      ai_system_id: null,
      metadata: governanceMetadata,
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

    // Add governance metadata to response for transparency
    if (governance.violations.length > 0 || outputGovernance.violations.length > 0) {
      normalizedData.governance = {
        blocked: false,
        warnings: [
          ...governance.violations.map((v: any) => v.id),
          ...outputGovernance.violations.map((v: any) => v.id),
        ],
      };
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
