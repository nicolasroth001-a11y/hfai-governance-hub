import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, d?: unknown) =>
  console.log(`[INGEST-EVENT] ${step}${d ? ` – ${JSON.stringify(d)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ── Auth: support both API-key (external systems) and Bearer (frontend) ──
    const apiKey = req.headers.get("x-api-key");
    const authHeader = req.headers.get("authorization");

    let orgId: string;
    let aiSystemId: string | null = null;

    if (apiKey) {
      const { data: org, error } = await supabase
        .from("organizations")
        .select("id, api_key")
        .eq("api_key", apiKey)
        .maybeSingle();

      if (error || !org) {
        log("Invalid API key");
        return new Response(JSON.stringify({ error: "Invalid API key" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      orgId = org.id;
      log("Authenticated via API key", { orgId });
    } else if (authHeader) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userErr } = await userClient.auth.getUser(token);
      if (userErr || !userData?.user?.id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userId = userData.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", userId)
        .single();

      if (!profile?.org_id) {
        return new Response(JSON.stringify({ error: "No organization linked" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      orgId = profile.org_id;
      log("Authenticated via Bearer", { userId, orgId });
    } else {
      return new Response(JSON.stringify({ error: "Authentication required (x-api-key or Bearer token)" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Parse body ──
    const body = await req.json();
    const { event_type, payload, ai_system_id } = body;

    if (!event_type) {
      return new Response(JSON.stringify({ error: "event_type is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    aiSystemId = ai_system_id || null;
    const inputText = typeof payload === "string" ? payload : JSON.stringify(payload);

    // 1. Log the user event
    const eventPayload = typeof payload === "object" ? payload : { message: payload, timestamp: new Date().toISOString() };
    const { data: userEvent, error: insertErr } = await supabase
      .from("ai_events")
      .insert({
        ai_system_id: aiSystemId,
        event_type,
        payload: eventPayload,
        input_text: inputText,
        org_id: orgId,
      })
      .select()
      .single();

    if (insertErr) throw new Error(`Insert event failed: ${insertErr.message}`);
    log("Event logged", { id: userEvent.id });

    // 2. Check rules for violations — hybrid: keyword match + AI classification
    //    This includes Art. 5 prohibited practice detection via keyword + AI classifiers
    const { data: rules } = await supabase
      .from("rules")
      .select("*")
      .or(`org_id.eq.${orgId},org_id.is.null`)
      .eq("enabled", true);

    // Built-in Art. 5 prohibited practice classifiers (always active)
    const PROHIBITED_PRACTICE_PATTERNS = [
      { pattern: /subliminal|manipulat(?:e|ion|ive)|coerci(?:on|ve)/i, label: "Art.5(1)(a) Subliminal Manipulation", severity: "critical" },
      { pattern: /exploit.*(?:vulnerab|elderly|disabled|child|minor|age)/i, label: "Art.5(1)(a) Exploitation of Vulnerabilities", severity: "critical" },
      { pattern: /social.?scor(?:e|ing)|citizen.?score|social.?credit/i, label: "Art.5(1)(c) Social Scoring", severity: "critical" },
      { pattern: /predictive.?polic|crime.?predict|criminal.?profil/i, label: "Art.5(1)(d) Predictive Policing", severity: "critical" },
      { pattern: /facial.?scrap|face.?databas|biometric.?scrap|scrape.*face/i, label: "Art.5(1)(e) Untargeted Facial Scraping", severity: "critical" },
      { pattern: /emotion.?recogni|emotion.?detect|sentiment.*(?:workplace|school|employee)/i, label: "Art.5(1)(f) Workplace Emotion Recognition", severity: "high" },
      { pattern: /biometric.?categori|race.?detect|biometric.?classif/i, label: "Art.5(1)(g) Biometric Categorisation", severity: "critical" },
      { pattern: /real.?time.*biometric|remote.*identif.*public|facial.*recognition.*public/i, label: "Art.5(1)(h) Real-time Remote Biometric ID", severity: "critical" },
    ];

    // Check for prohibited practices in input
    const prohibitedMatches = PROHIBITED_PRACTICE_PATTERNS.filter(p => p.pattern.test(inputText || ""));
    for (const match of prohibitedMatches) {
      const { data: violation } = await supabase
        .from("violations")
        .insert({
          ai_system_id: aiSystemId,
          description: `Prohibited practice detected: ${match.label} [built-in Art.5 classifier]`,
          severity: match.severity,
          ai_event_id: userEvent.id,
          org_id: orgId,
        })
        .select()
        .single();

      if (violation) {
        violations.push(violation);
        blockedRules.push({
          ruleId: `art5-${match.label}`,
          ruleName: match.label,
          description: `EU AI Act Article 5 prohibits this practice. Fines up to €35M or 7% of global turnover.`,
          severity: match.severity,
        });
        await supabase.from("audit_logs").insert({
          action: "prohibited_practice_blocked",
          entity_type: "violation",
          entity_id: violation.id,
          details: `Art. 5 prohibited practice detected: ${match.label}`,
          org_id: orgId,
        });
      }
      log("Art.5 prohibited practice detected", { label: match.label });
    }

    const violations: unknown[] = [];
    const blockedRules: { ruleId: string; ruleName: string; description: string; severity: string }[] = [];
    const keywordMatched: string[] = [];

    if (rules && rules.length > 0) {
      // Phase 1: Fast keyword pre-filter
      for (const rule of rules) {
        if (rule.condition) {
          try {
            const condStr = typeof rule.condition === "string" ? rule.condition : JSON.stringify(rule.condition);
            if (inputText && condStr) {
              const keywords = condStr.toLowerCase().split(/[,\s]+/).filter(Boolean);
              const lowerInput = inputText.toLowerCase();
              if (keywords.some((kw: string) => kw.length > 2 && lowerInput.includes(kw))) {
                keywordMatched.push(rule.id);
              }
            }
          } catch { /* skip */ }
        }
      }

      // Phase 2: AI classification for ambiguous content
      let aiClassifiedRuleIds: string[] = [];
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      if (keywordMatched.length === 0 && inputText && inputText.length > 10 && lovableApiKey) {
        try {
          const ruleDescriptions = rules.map((r: any) => `- ${r.id}: ${r.name} — ${r.description || "No description"} (severity: ${r.severity})`).join("\n");
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
                  content: `You are an AI governance rule evaluator. Given user input/output text and a list of rules, determine which rules (if any) are violated. Reply ONLY with a JSON array of violated rule IDs, e.g. ["R-001","R-003"]. If none are violated, reply [].`,
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
              aiClassifiedRuleIds = parsed.filter((id: string) => rules.some((r: any) => r.id === id));
              log("AI classification result", { aiClassifiedRuleIds });
            }
          }
        } catch (e) {
          log("AI classification failed (falling back to keyword-only)", { error: String(e) });
        }
      }

      // Combine matched rule IDs
      const violatedRuleIds = new Set([...keywordMatched, ...aiClassifiedRuleIds]);

      for (const rule of rules) {
        if (!violatedRuleIds.has(rule.id)) continue;

        const detectionMethod = keywordMatched.includes(rule.id) ? "keyword" : "ai_classification";
        const enforcementMode = rule.enforcement_mode || "monitor";

        // Track blocked rules for response
        if (enforcementMode === "block") {
          blockedRules.push({
            ruleId: rule.id,
            ruleName: rule.name,
            description: rule.description || "This content violates our governance policy.",
            severity: rule.severity || "medium",
          });
        }

        const { data: violation } = await supabase
          .from("violations")
          .insert({
            ai_system_id: aiSystemId,
            rule_id: rule.id,
            description: `Rule violated: ${rule.name} – ${rule.description || ""} [detected via ${detectionMethod}, enforcement: ${enforcementMode}]`,
            severity: rule.severity || "medium",
            ai_event_id: userEvent.id,
            org_id: orgId,
          })
          .select()
          .single();

        if (violation) {
          violations.push(violation);
          await supabase.from("audit_logs").insert({
            action: enforcementMode === "block" ? "violation_blocked" : "violation_created",
            entity_type: "violation",
            entity_id: violation.id,
            details: `Auto-detected (${detectionMethod}, ${enforcementMode}): ${rule.name}`,
            org_id: orgId,
          });
        }
        log("Violation created", { ruleId: rule.id, violationId: violation?.id, detectionMethod, enforcementMode });
      }
    }

    // If any rule triggered a BLOCK, return 451 with explanation
    if (blockedRules.length > 0) {
      log("Response BLOCKED", { blockedRules: blockedRules.map(r => r.ruleName) });

      const explanations = blockedRules.map(r =>
        `• ${r.ruleName}: ${r.description}`
      ).join("\n");

      return new Response(
        JSON.stringify({
          blocked: true,
          message: "This request was blocked by your organization's AI governance policy.",
          explanation: `The following governance rules were triggered:\n${explanations}`,
          blocked_rules: blockedRules,
          violations,
          userEvent,
        }),
        {
          status: 451, // Unavailable For Legal Reasons
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Generate AI response for user messages (only if not blocked)
    let assistantEvent = null;
    if (event_type === "user_message" && inputText) {
      try {
        const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
        if (lovableApiKey) {
          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${lovableApiKey}`,
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: "You are a helpful AI assistant. Keep responses concise." },
                { role: "user", content: inputText },
              ],
              max_tokens: 512,
            }),
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const reply = aiData.choices?.[0]?.message?.content || "";

            if (reply) {
              const { data: aEvt } = await supabase
                .from("ai_events")
                .insert({
                  ai_system_id: aiSystemId,
                  event_type: "assistant_message",
                  payload: { message: reply, timestamp: new Date().toISOString() },
                  output_text: reply,
                  org_id: orgId,
                })
                .select()
                .single();

              assistantEvent = aEvt;
              log("Assistant reply generated");
            }
          }
        }
      } catch (e) {
        log("AI response generation failed (non-fatal)", { error: String(e) });
      }
    }

    // 4. Trigger webhook delivery for violations (fire-and-forget)
    if (violations.length > 0) {
      for (const v of violations as any[]) {
        try {
          fetch(`${supabaseUrl}/functions/v1/deliver-webhook`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({ violation_id: v.id, event_type: "violation.created" }),
          }).catch(() => {});
        } catch { /* non-blocking */ }
      }
      log("Webhook delivery triggered", { count: violations.length });
    }

    return new Response(
      JSON.stringify({ blocked: false, userEvent, assistantEvent, violations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
