import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are a senior B2B lead-generation analyst for HFAI (Human-First AI), an AI governance platform that helps companies comply with the EU AI Act, NIST AI RMF, and ISO 42001.

HFAI's core wedge:
- AI-SBOM: signed Article 11 technical documentation
- Tamper-evident human oversight (Article 14) with SHA-256 hash chain
- Pre-deployment readiness gating (Article 26)
- Shadow AI discovery + dual-mode enforcement (monitor or block)

YOUR JOB: produce HIGH-INTENT prospects — companies that have a real, dated regulatory obligation HFAI solves.

QUALITY BAR (non-negotiable):
1. **Real companies only.** Use companies that actually exist and visibly deploy AI. No invented brands, no "Acme Corp", no famous logos as fake customers (no OpenAI/Google/Microsoft/etc. as prospects).
2. **EU-based or EU-exposed.** They must be subject to the EU AI Act (operate in EU, sell to EU customers, or process EU citizen data).
3. **Mid-market sweet spot.** 200–5,000 employees. Big enough to have compliance budget, small enough to not have a 50-person internal GRC team.
4. **High-risk AI use case.** Must map to EU AI Act Annex III (HR/recruiting, credit/insurance, education, healthcare, law enforcement, critical infra, biometrics) OR be a GPAI deployer with >10k EU users.
5. **Buyer-grade contact.** Target ONE of: Head of AI Governance, Chief AI Officer, Chief Compliance Officer, DPO, CISO, Head of Risk, VP Legal/Regulatory. Never "VP Engineering" or "CTO" unless the company has no compliance function.
6. **Plausible email.** Use the company's real domain, format firstname.lastname@domain or first@domain — whatever matches that company's known convention.

For each prospect return:
- company_name (real)
- website (real domain, no https://)
- industry (specific: "Insurance — health" not just "Insurance")
- company_size ("200-1000", "1k-5k", "5k+")
- region (country + EU/UK/US-EU)
- contact_name (plausible name fitting region)
- contact_title (from buyer list above)
- contact_email (real-domain best guess)
- ai_use_case (specific: "AI-driven CV screening for engineering roles" not "uses AI")
- pain_points (the SPECIFIC regulatory gap — cite Article number)
- rationale (1-2 sentences, why HFAI fits THIS company's deadline)

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

    const userPrompt = `Generate ${safeCount} HIGH-INTENT prospect companies for HFAI.

Industry filter: ${industry || "any high-risk AI sector under EU AI Act Annex III (HR/recruiting, credit/insurance, healthcare, education, biometrics, critical infra) OR GPAI deployers with EU exposure"}
Region: ${region || "EU-based preferred (DE, FR, NL, IE, ES, IT, Nordics) or EU-exposed UK/US"}
Company size: ${company_size || "mid-market: 200–5,000 employees"}
Additional brief: ${custom_brief || "none"}

${dedupBlock}

Each prospect MUST have a clearly stated EU AI Act article (11, 14, 26, or Annex III) tied to its pain point. If you cannot tie a company to a real regulatory clock, do not include it.

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
    async function verifyWebsite(rawSite: string): Promise<{ status: string; notes: string }> {
      const site = (rawSite || "").trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
      if (!site || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(site)) {
        return { status: "invalid", notes: "No valid domain provided" };
      }
      const tryUrls = [`https://${site}`, `https://www.${site}`];
      for (const url of tryUrls) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 6000);
          const resp = await fetch(url, {
            method: "GET",
            redirect: "follow",
            signal: ctrl.signal,
            headers: { "User-Agent": "Mozilla/5.0 (HFAI lead verifier)" },
          });
          clearTimeout(t);
          if (resp.status >= 200 && resp.status < 400) {
            return { status: "verified", notes: `HTTP ${resp.status} from ${url}` };
          }
          if (resp.status === 403 || resp.status === 401 || resp.status === 429) {
            // Likely a real site blocking bots
            return { status: "verified", notes: `HTTP ${resp.status} (bot-blocked, site exists)` };
          }
        } catch (err) {
          // try next
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
