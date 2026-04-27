import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are a B2B lead-generation analyst for HFAI (Human-First AI), an AI governance platform that helps companies comply with the EU AI Act, NIST AI RMF, and ISO 42001. HFAI provides:
- AI-SBOM (technical documentation, Article 11)
- Tamper-evident human oversight audit trails (Article 14)
- Pre-deployment readiness gating (Article 26)
- Shadow AI discovery, rule enforcement, and dual-mode (monitor/block) interception

Your job: generate realistic prospect companies that would benefit from HFAI. For each company, provide:
- company_name
- website (best-guess domain)
- industry
- company_size (e.g. "200-1000", "1k-5k", "5k+")
- region
- contact_name (a plausible name for the role)
- contact_title (e.g. Head of AI Governance, Chief Compliance Officer, VP Engineering, CISO)
- contact_email (use the website domain — best guess, e.g. firstname.lastname@domain)
- ai_use_case (specifically what AI they likely deploy)
- pain_points (regulatory, audit, oversight gaps)
- rationale (why HFAI is a strong fit, 1-2 sentences)

Be realistic — pick companies that genuinely deploy high-risk AI in the requested industry/region. Prioritize EU-based or EU-exposed companies given the AI Act timeline. Do not fabricate famous brands as customers.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin
    const { data: roleData } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { industry = "", region = "", company_size = "", count = 5, custom_brief = "" } = await req.json();
    const safeCount = Math.min(Math.max(parseInt(String(count)) || 5, 1), 10);

    const userPrompt = `Generate ${safeCount} prospect companies for HFAI.
Industry filter: ${industry || "any high-risk AI sector (finance, healthcare, HR/recruiting, education, law enforcement, critical infra)"}
Region: ${region || "EU-focused, US-EU exposed"}
Company size: ${company_size || "mid-to-large enterprise"}
Additional brief: ${custom_brief || "none"}

Return ONLY via the function call.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt }],
        tools: [{
          type: "function",
          function: {
            name: "return_leads",
            description: "Return prospect companies for HFAI",
            parameters: {
              type: "object",
              properties: {
                leads: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      company_name: { type: "string" },
                      website: { type: "string" },
                      industry: { type: "string" },
                      company_size: { type: "string" },
                      region: { type: "string" },
                      contact_name: { type: "string" },
                      contact_title: { type: "string" },
                      contact_email: { type: "string" },
                      ai_use_case: { type: "string" },
                      pain_points: { type: "string" },
                      rationale: { type: "string" },
                    },
                    required: ["company_name", "industry", "contact_email", "ai_use_case", "rationale"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["leads"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_leads" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again in a moment" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted — top up at Settings → Workspace → Usage" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");
    const parsed = JSON.parse(toolCall.function.arguments);
    const leads = parsed.leads || [];

    // Insert into DB
    const rows = leads.map((l: any) => ({
      company_name: l.company_name,
      website: l.website || "",
      industry: l.industry || "",
      company_size: l.company_size || "",
      region: l.region || "",
      contact_name: l.contact_name || "",
      contact_title: l.contact_title || "",
      contact_email: l.contact_email || "",
      ai_use_case: l.ai_use_case || "",
      pain_points: l.pain_points || "",
      rationale: l.rationale || "",
      status: "new",
      generated_by: userData.user.id,
    }));

    const { data: inserted, error: insErr } = await supabase.from("leads").insert(rows).select();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ leads: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-leads error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
