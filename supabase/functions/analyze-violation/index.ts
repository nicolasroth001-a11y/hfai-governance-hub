import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { violation_id } = await req.json();
    if (!violation_id) throw new Error("violation_id is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch violation with related data
    const { data: violation, error: vErr } = await supabase
      .from("violations")
      .select("*")
      .eq("id", violation_id)
      .single();
    if (vErr || !violation) throw new Error("Violation not found");

    // Fetch the rule that was violated
    let rule = null;
    if (violation.rule_id) {
      const { data } = await supabase.from("rules").select("*").eq("id", violation.rule_id).single();
      rule = data;
    }

    // Fetch the AI event that triggered it
    let aiEvent = null;
    if (violation.ai_event_id) {
      const { data } = await supabase.from("ai_events").select("*").eq("id", violation.ai_event_id).single();
      aiEvent = data;
    }

    // Fetch similar violations (same rule or same AI system)
    const { data: similarViolations } = await supabase
      .from("violations")
      .select("id, description, severity, detected_at, status")
      .neq("id", violation_id)
      .or(`rule_id.eq.${violation.rule_id},ai_system_id.eq.${violation.ai_system_id}`)
      .order("detected_at", { ascending: false })
      .limit(10);

    // Build AI prompt
    const systemPrompt = `You are an AI governance expert performing Root Cause Analysis on AI system violations. 
Analyze the violation data and provide:
1. A clear root cause diagnosis explaining WHY this violation occurred
2. Specific written recommendations for remediation
3. Suggested rule changes or new rules to prevent recurrence
4. Whether this appears to be part of a pattern based on similar violations

Be specific, actionable, and concise. Reference the actual data provided.`;

    const userPrompt = `Analyze this AI governance violation:

VIOLATION:
- ID: ${violation.id}
- Description: ${violation.description}
- Severity: ${violation.severity}
- Status: ${violation.status}
- Detected at: ${violation.detected_at}

${rule ? `VIOLATED RULE:
- Name: ${rule.name}
- Description: ${rule.description}
- Category: ${rule.category}
- Condition: ${rule.condition}` : "No specific rule linked."}

${aiEvent ? `TRIGGERING EVENT:
- Type: ${aiEvent.event_type}
- Input: ${aiEvent.input_text || "N/A"}
- Output: ${aiEvent.output_text || "N/A"}
- Payload: ${JSON.stringify(aiEvent.payload)}` : "No triggering event linked."}

SIMILAR VIOLATIONS (${(similarViolations || []).length} found):
${(similarViolations || []).map((sv: any) => `- ${sv.description} (${sv.severity}, ${sv.status})`).join("\n") || "None found."}`;

    // Call Lovable AI with tool calling for structured output
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_rca",
              description: "Provide the root cause analysis results",
              parameters: {
                type: "object",
                properties: {
                  diagnosis: {
                    type: "string",
                    description: "Root cause explanation of why the violation occurred",
                  },
                  recommendations: {
                    type: "string",
                    description: "Written remediation recommendations (markdown formatted)",
                  },
                  suggested_rules: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string", enum: ["create", "modify", "disable"] },
                        name: { type: "string" },
                        description: { type: "string" },
                        severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                        reason: { type: "string" },
                      },
                      required: ["action", "name", "description", "severity", "reason"],
                      additionalProperties: false,
                    },
                  },
                  is_pattern: {
                    type: "boolean",
                    description: "Whether this violation appears to be part of a recurring pattern",
                  },
                  pattern_description: {
                    type: "string",
                    description: "Description of the pattern if detected",
                  },
                  remediation_steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                      },
                      required: ["title", "description", "priority"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["diagnosis", "recommendations", "suggested_rules", "is_pattern", "pattern_description", "remediation_steps"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_rca" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No AI analysis returned");

    const rca = JSON.parse(toolCall.function.arguments);

    // Store the RCA
    const { data: rcaRecord, error: rcaErr } = await supabase
      .from("root_cause_analyses")
      .insert({
        violation_id,
        org_id: violation.org_id,
        ai_diagnosis: rca.diagnosis,
        ai_recommendations: rca.recommendations,
        ai_suggested_rules: rca.suggested_rules,
        status: "ai_completed",
      })
      .select()
      .single();

    if (rcaErr) throw new Error(`Failed to save RCA: ${rcaErr.message}`);

    // Create remediation action items
    if (rca.remediation_steps?.length > 0) {
      const actions = rca.remediation_steps.map((step: any) => ({
        rca_id: rcaRecord.id,
        violation_id,
        org_id: violation.org_id,
        title: step.title,
        description: step.description,
        status: "pending",
      }));
      await supabase.from("remediation_actions").insert(actions);
    }

    // Check for pattern and store if detected
    if (rca.is_pattern && (similarViolations || []).length > 1) {
      await supabase.from("violation_patterns").insert({
        org_id: violation.org_id,
        pattern_name: `Pattern: ${rule?.name || violation.description?.slice(0, 50)}`,
        description: rca.pattern_description,
        violation_ids: [violation_id, ...(similarViolations || []).slice(0, 5).map((sv: any) => sv.id)],
        rule_ids: violation.rule_id ? [violation.rule_id] : [],
        frequency: (similarViolations || []).length + 1,
        first_seen: (similarViolations || []).at(-1)?.detected_at || violation.detected_at,
        last_seen: violation.detected_at,
      });
    }

    // Log the analysis in audit trail
    await supabase.from("audit_logs").insert({
      action: "rca_completed",
      entity_type: "violation",
      entity_id: violation_id,
      details: `AI root cause analysis completed. Pattern detected: ${rca.is_pattern}`,
      org_id: violation.org_id,
    });

    return new Response(JSON.stringify({
      rca: rcaRecord,
      diagnosis: rca.diagnosis,
      recommendations: rca.recommendations,
      suggested_rules: rca.suggested_rules,
      remediation_steps: rca.remediation_steps,
      is_pattern: rca.is_pattern,
      pattern_description: rca.pattern_description,
      similar_violations: similarViolations || [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-violation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
