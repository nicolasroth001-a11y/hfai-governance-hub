import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are a senior B2B lead-research analyst for HFAI (Human-First AI), an AI governance platform OBSESSING on a single wedge market: **EU mid-market insurers using AI in claims, underwriting, fraud detection, or pricing**.

CRITICAL ANTI-HALLUCINATION RULE:
- You MUST NOT invent specific people. Do NOT return contact_name, contact_title, or contact_email — those fields will be filled in by a human researcher on LinkedIn after you return the company.
- You ONLY return real, verifiable companies and a regulator-grade reason to talk to them.
- If you are not confident a company actually exists with the AI use case described, DO NOT include it.


WHY INSURANCE / WHY NOW:
- EU AI Act Annex III explicitly classifies AI used in life and health insurance pricing/risk and credit scoring as HIGH-RISK (Article 6 + Annex III §5).
- AI-driven claims triage and fraud denial decisions affect consumers and trigger Article 14 (human oversight) + Article 26 (deployer obligations).
- EIOPA published AI supervisory expectations in 2024; Solvency II already requires model governance — insurers have the muscle but not the AI-specific evidence.
- Article 11 technical documentation obligations bite for high-risk AI in 2026.
- These insurers ALREADY do model validation for actuarial models. They have a CRO and a model-risk team. They are the easiest "yes" in the entire EU AI Act target list.

HFAI's core wedge maps directly to insurer pain:
- AI-SBOM: signed Article 11 technical documentation per AI model (claims triage, fraud, pricing)
- Tamper-evident human oversight (Article 14) with SHA-256 hash chain — proves a human reviewed the denial
- Pre-deployment readiness gating (Article 26) — blocks an unvalidated model from going live
- Shadow AI discovery — finds the underwriter's Excel-with-GPT habit before the regulator does

YOUR JOB: produce HIGH-INTENT INSURANCE prospects — real EU insurers with a dated regulatory obligation HFAI solves.

QUALITY BAR (non-negotiable):
1. **Real EU insurers only.** Actual carriers, MGAs, or insurtechs operating in EU markets (DE, NL, FR, IE, ES, IT, Nordics, BE, AT, PL). UK insurers OK if they sell into EU. No invented brands. No reinsurers (Munich Re/Swiss Re tier — too slow). No mega-multinationals (Allianz/AXA/Generali group level — too long a sales cycle; subsidiaries OK).
2. **Mid-market sweet spot.** €500M–€5B GWP, 200–3,000 employees. Big enough to have a CRO and compliance budget, small enough that a founder email gets read.
3. **AI use case must be in claims, underwriting, fraud, or pricing.** Not "they have a chatbot." Specific: "AI-assisted bodily-injury claims triage", "ML fraud scoring for motor claims", "AI-driven life underwriting via accelerated UW platform", "GLM/GBM pricing model in motor".
4. **Buyer-grade contact.** Target ONE of (in order of preference): Chief Risk Officer, Head of Model Risk Management, Head of Actuarial / Chief Actuary, Chief Compliance Officer, DPO, Head of Claims (only if AI-claims focus), Head of Underwriting (only if AI-UW focus), CISO. NEVER CTO/VP Engineering. NEVER generic "Head of Innovation".
5. **Plausible email.** Use the insurer's real domain, format matching that company's known convention (firstname.lastname@, f.lastname@, first@).
6. **Cite the regulatory clock.** Pain points MUST reference at least ONE of: EU AI Act Annex III §5, Article 11, Article 14, Article 26, EIOPA AI guidance, Solvency II model governance (CP14/SII Pillar II).

For each prospect return:
- company_name (real)
- website (real domain, no https://)
- industry (specific: "Insurance — health" not just "Insurance")
- company_size ("200-1000", "1k-5k", "5k+")
- region (country + EU/UK/US-EU)
- ai_use_case (specific: "AI-driven CV screening for engineering roles" not "uses AI")
- pain_points (the SPECIFIC regulatory gap — cite Article number)
- rationale (1-2 sentences, why HFAI fits THIS company's deadline)
- email_subject (a draft subject line addressed to a generic role like "Head of Model Risk" — NOT a person)
- email_body (a draft 4-6 sentence cold email opening with "Hi {{first_name}}," — leave the placeholder literal so a human fills it in)

DO NOT RETURN: contact_name, contact_title, contact_email. Those are filled in by a human after LinkedIn research.

DEDUPLICATION: You will be given a list of companies already in the pipeline. NEVER return any of those companies — pick fresh prospects.`;

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

    const { data: roleData } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { industry = "", region = "", company_size = "", count = 5, custom_brief = "" } = await req.json();
    const safeCount = Math.min(Math.max(parseInt(String(count)) || 5, 1), 10);

    // WEDGE LOCK: default everything to insurance unless admin overrides explicitly
    const effectiveIndustry = industry || "Insurance — EU mid-market carriers using AI in claims, underwriting, fraud, or pricing (P&C and Life/Health)";
    const effectiveRegion = region || "EU-based: DE, NL, FR, IE, ES, IT, Nordics, BE, AT, PL — or UK insurers selling into EU";
    const effectiveSize = company_size || "Mid-market: €500M–€5B GWP, 200–3,000 employees";

    // Pull existing companies to avoid duplicates
    const { data: existingLeads } = await supabase
      .from("leads")
      .select("company_name")
      .order("created_at", { ascending: false })
      .limit(500);
    const existingNames = (existingLeads || []).map((l: any) => l.company_name).filter(Boolean);
    const dedupBlock = existingNames.length
      ? `EXISTING COMPANIES IN PIPELINE — DO NOT RETURN ANY OF THESE:\n${existingNames.join(", ")}`
      : "Pipeline is empty — pick the strongest fresh prospects.";

    const userPrompt = `Generate ${safeCount} HIGH-INTENT INSURANCE prospects for HFAI.

Industry: ${effectiveIndustry}
Region: ${effectiveRegion}
Company size: ${effectiveSize}
Additional brief: ${custom_brief || "none"}

${dedupBlock}

Each prospect MUST:
- Be a REAL EU insurer (carrier, MGA, or scaled insurtech) currently using AI in claims, underwriting, fraud, or pricing
- Have a clearly stated EU AI Act article (Annex III §5, Article 11, 14, or 26) OR EIOPA/Solvency II model governance hook tied to its pain point
- Name a buyer-grade contact (CRO, Head of Model Risk, Chief Actuary, CCO, DPO, CISO) — never CTO/VP Eng
- Have a plausible email at the insurer's actual domain

If you cannot tie a company to a real insurance AI use case AND a real regulatory clock, do not include it. Quality > quantity.

Return ONLY via the function call.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt }],
        temperature: 0.8,
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
      const t = await aiResp.text().catch(() => "");
      console.error("AI error:", aiResp.status, t);
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again in a moment" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted — top up at Settings → Workspace → Usage" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway ${aiResp.status}: ${t.slice(0, 200)}`);
    }

    // Read body as text first so we can give a clear error if it's empty/truncated
    const aiText = await aiResp.text().catch(() => "");
    if (!aiText || aiText.trim().length === 0) {
      throw new Error("AI gateway returned an empty response — please retry");
    }
    let aiData: any;
    try {
      aiData = JSON.parse(aiText);
    } catch (e) {
      console.error("AI response not JSON:", aiText.slice(0, 500));
      throw new Error("AI gateway returned malformed JSON — please retry");
    }
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call. Full response:", JSON.stringify(aiData).slice(0, 500));
      throw new Error("AI did not return structured leads — please retry");
    }
    let parsed: any;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new Error("AI returned malformed lead data — please retry");
    }
    let leads = parsed.leads || [];

    // Server-side dedup safety net (case-insensitive)
    const existingLower = new Set(existingNames.map((n: string) => n.toLowerCase().trim()));
    leads = leads.filter((l: any) => l.company_name && !existingLower.has(l.company_name.toLowerCase().trim()));

    if (leads.length === 0) {
      return new Response(JSON.stringify({ leads: [], note: "All generated companies were duplicates. Try a different industry/region filter." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify each lead by fetching its website. Mark as verified / invalid / unverified.
    // CRITICAL: always cancel the response body to avoid leaked streams in edge runtime.
    async function verifyWebsite(rawSite: string): Promise<{ status: string; notes: string }> {
      const site = (rawSite || "").trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
      if (!site || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(site)) {
        return { status: "invalid", notes: "No valid domain provided" };
      }
      const tryUrls = [`https://${site}`, `https://www.${site}`];
      for (const url of tryUrls) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        try {
          const resp = await fetch(url, {
            method: "HEAD",
            redirect: "follow",
            signal: ctrl.signal,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; HFAI-LeadVerifier/1.0)" },
          });
          // HEAD has no body but cancel anyway just in case
          try { await resp.body?.cancel(); } catch { /* ignore */ }
          clearTimeout(t);
          if (resp.status >= 200 && resp.status < 400) {
            return { status: "verified", notes: `HTTP ${resp.status} from ${url}` };
          }
          if (resp.status === 401 || resp.status === 403 || resp.status === 405 || resp.status === 429) {
            return { status: "verified", notes: `HTTP ${resp.status} (site exists, blocks bots/HEAD)` };
          }
        } catch {
          clearTimeout(t);
          // try next URL
        }
      }
      return { status: "invalid", notes: "Website unreachable — likely fabricated" };
    }

    const verifications = await Promise.all(
      leads.map((l: any) => verifyWebsite(l.website || ""))
    );

    const rows = leads.map((l: any, i: number) => ({
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
      status: verifications[i].status === "verified" ? "new" : "unverified",
      verification_status: verifications[i].status,
      verification_notes: verifications[i].notes,
      verified_at: new Date().toISOString(),
      generated_by: userData.user.id,
    }));

    const verifiedCount = verifications.filter((v) => v.status === "verified").length;
    const invalidCount = verifications.length - verifiedCount;

    const { data: inserted, error: insErr } = await supabase.from("leads").insert(rows).select();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({
      leads: inserted,
      verified: verifiedCount,
      invalid: invalidCount,
      note: invalidCount > 0 ? `${invalidCount} of ${verifications.length} leads failed website verification and are marked 'unverified'.` : undefined,
    }), {
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
