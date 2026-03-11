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
      // Hash the key and look up the org via organizations.api_key
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
      // Frontend call — resolve user's org from profile
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
      if (claimsErr || !claims?.claims?.sub) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userId = claims.claims.sub as string;

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

    // 2. Check rules for violations
    const { data: rules } = await supabase
      .from("rules")
      .select("*")
      .or(`org_id.eq.${orgId},org_id.is.null`)
      .eq("enabled", true);

    const violations: unknown[] = [];

    if (rules && rules.length > 0) {
      for (const rule of rules) {
        let violated = false;

        // Check condition-based matching
        if (rule.condition) {
          try {
            const condStr = typeof rule.condition === "string" ? rule.condition : JSON.stringify(rule.condition);
            // Simple keyword matching against input text
            if (inputText && condStr) {
              const keywords = condStr.toLowerCase().split(/[,\s]+/).filter(Boolean);
              const lowerInput = inputText.toLowerCase();
              violated = keywords.some((kw: string) => kw.length > 2 && lowerInput.includes(kw));
            }
          } catch {
            // Skip malformed conditions
          }
        }

        if (violated) {
          const { data: violation } = await supabase
            .from("violations")
            .insert({
              ai_system_id: aiSystemId,
              rule_id: rule.id,
              description: `Rule violated: ${rule.name} – ${rule.description || ""}`,
              severity: rule.severity || "medium",
              ai_event_id: userEvent.id,
              org_id: orgId,
            })
            .select()
            .single();

          if (violation) {
            violations.push(violation);
            await supabase.from("audit_logs").insert({
              action: "violation_created",
              entity_type: "violation",
              entity_id: violation.id,
              details: `Auto-detected: ${rule.name}`,
              org_id: orgId,
            });
          }
          log("Violation created", { ruleId: rule.id, violationId: violation?.id });
        }
      }
    }

    // 3. Generate AI response for user messages
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

    return new Response(
      JSON.stringify({ userEvent, assistantEvent, violations }),
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
