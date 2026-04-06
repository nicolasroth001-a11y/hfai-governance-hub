import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

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
    const { email, answers } = await req.json();

    if (!email || !answers || !Array.isArray(answers) || answers.length !== 3) {
      return new Response(
        JSON.stringify({ error: "Email and 3 quiz answers are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from answers
    const q1 = answers[0] === "yes" ? "Their AI systems DO make decisions affecting people (likely high-risk under EU AI Act)." : "Their AI systems do NOT make decisions affecting people.";
    const q2 = answers[1] === "yes" ? "They CAN produce a complete audit trail of AI decisions." : "They CANNOT produce a complete audit trail (Article 12 gap).";
    const q3 = answers[2] === "yes" ? "A human DOES review AI outputs before they reach end users." : "No human reviews AI outputs before they reach end users (Article 14 gap).";

    let riskScore = 0;
    if (answers[0] === "yes") riskScore++;
    if (answers[1] === "no") riskScore++;
    if (answers[2] === "no") riskScore++;

    const riskLevel = riskScore >= 2 ? "HIGH" : riskScore === 1 ? "MODERATE" : "LOW";

    const systemPrompt = `You are an AI compliance consultant for HFAI (Human-First AI), a platform that helps organizations comply with the EU AI Act and NIST AI RMF. 

Generate a personalized compliance risk report based on quiz answers. Be specific, actionable, and reference actual EU AI Act articles. The tone should be professional but urgent where gaps exist.

Format the report as a JSON object with these fields:
- executiveSummary: 2-3 sentences summarizing their risk posture
- riskLevel: "${riskLevel}"
- gaps: array of objects with { title, article, description, recommendation } for each compliance gap found
- strengths: array of strings listing what they're doing right
- nextSteps: array of 3 specific next steps they should take
- estimatedFine: string describing potential fine exposure under EU AI Act`;

    const userPrompt = `Organization compliance quiz results:
1. ${q1}
2. ${q2}
3. ${q3}

Overall risk score: ${riskScore}/3 compliance gaps (${riskLevel} risk)

Generate a personalized EU AI Act compliance risk report for this organization.`;

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
              name: "generate_risk_report",
              description: "Generate a structured compliance risk report",
              parameters: {
                type: "object",
                properties: {
                  executiveSummary: { type: "string" },
                  riskLevel: { type: "string" },
                  gaps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        article: { type: "string" },
                        description: { type: "string" },
                        recommendation: { type: "string" },
                      },
                      required: ["title", "article", "description", "recommendation"],
                    },
                  },
                  strengths: { type: "array", items: { type: "string" } },
                  nextSteps: { type: "array", items: { type: "string" } },
                  estimatedFine: { type: "string" },
                },
                required: ["executiveSummary", "riskLevel", "gaps", "strengths", "nextSteps", "estimatedFine"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_risk_report" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "AI service is busy. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const report = JSON.parse(toolCall.function.arguments);

    // Send email with report via transactional email
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const idempotencyKey = `risk-report-${email}-${Date.now()}`;
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "risk-report",
        recipientEmail: email,
        idempotencyKey,
        templateData: report,
      },
    });

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-risk-report error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
