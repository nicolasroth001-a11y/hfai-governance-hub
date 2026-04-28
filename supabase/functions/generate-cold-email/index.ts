import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DRAFT_MODEL = "google/gemini-2.5-flash";

const SYSTEM = `You are Nicolas Roth, founder of HFAI (Human-First AI), writing a cold email to a prospect.

HFAI is a governance platform for companies deploying high-risk AI. Core differentiators:
- AI-SBOM: signed technical documentation (EU AI Act Article 11)
- Tamper-evident human oversight with SHA-256 hash chain (Article 14)
- Pre-deployment readiness gating (Article 26)
- Shadow AI discovery + dual-mode enforcement (monitor or block)

Tone:
- Founder-personal, sharp, no fluff
- Open with the SPECIFIC HOOK provided (a real observation about their site, recent news, or industry deadline) — never generic
- One concrete value prop tied to that hook
- One soft CTA (15-min call, not "let me know what you think")
- No emoji, no exclamation marks, no "I hope this email finds you well", no "I came across your company"
- Max 130 words body
- Sign as "Nicolas Roth, Founder, HFAI — hfa-i.org"

Subject lines: 4-7 words, regulatory or operational hook tied to the lead, no clickbait.

Return via function call only.`;

// Lightweight HTML → text extractor for hook discovery
function extractText(html: string, maxChars = 4000): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxChars);
}

async function fetchWithTimeout(url: string, ms = 4000): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (HFAI-LeadResearch/1.0)" },
      redirect: "follow",
    });
    clearTimeout(t);
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("text/html") && !ct.includes("text/plain")) return null;
    return await r.text();
  } catch {
    return null;
  }
}

function normalizeUrl(raw: string): string | null {
  if (!raw) return null;
  let u = raw.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const url = new URL(u);
    return url.origin;
  } catch {
    return null;
  }
}

async function discoverHook(lead: any): Promise<string> {
  const origin = normalizeUrl(lead.website || "");
  const snippets: string[] = [];

  if (origin) {
    // Try homepage + a few common surfaces in parallel
    const candidates = [origin, `${origin}/about`, `${origin}/news`, `${origin}/press`, `${origin}/blog`];
    const htmls = await Promise.all(candidates.map((u) => fetchWithTimeout(u, 3500)));
    htmls.forEach((html, i) => {
      if (!html) return;
      const text = extractText(html, 1200);
      if (text.length > 200) snippets.push(`[${candidates[i]}]\n${text}`);
    });
  }

  if (!snippets.length) {
    // Industry-level fallback hook (always specific to a regulatory clock)
    const industry = (lead.industry || "").toLowerCase();
    if (industry.includes("financ") || industry.includes("bank") || industry.includes("insur"))
      return "EU AI Act Article 6 classifies AI used in credit scoring and insurance pricing as high-risk — Article 11 documentation deadline applies in 2026.";
    if (industry.includes("health"))
      return "MDR + EU AI Act overlap means health AI systems need both CE marking AND Article 11 technical documentation by 2026.";
    if (industry.includes("hr") || industry.includes("recruit") || industry.includes("staff"))
      return "AI used in hiring is explicitly named high-risk under Annex III — every screening or scoring model needs Article 14 human oversight evidence.";
    if (industry.includes("educ"))
      return "EU AI Act Annex III names AI in education (admissions, grading, proctoring) as high-risk — most edtech vendors haven't classified their stack.";
    return "EU AI Act Article 11 + 14 + 26 obligations apply to companies deploying high-risk AI — first enforcement actions land in 2026.";
  }

  return snippets.join("\n\n").slice(0, 6000);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userData.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { lead_id, custom_angle = "" } = await req.json();
    if (!lead_id) return new Response(JSON.stringify({ error: "lead_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: lead, error: leadErr } = await supabase.from("leads").select("*").eq("id", lead_id).single();
    if (leadErr || !lead) throw new Error("Lead not found");

    // NEW: discover a specific, recent hook for this lead
    const hookContext = await discoverHook(lead);

    const userPrompt = `Write a cold email to:
Company: ${lead.company_name}
Industry: ${lead.industry}
Contact: ${lead.contact_name || "(unknown)"} — ${lead.contact_title || "(unknown role)"}
AI use case: ${lead.ai_use_case}
Known pain points: ${lead.pain_points || "general AI governance gaps"}
Why HFAI fits: ${lead.rationale}
${custom_angle ? `Custom angle: ${custom_angle}` : ""}

SPECIFIC HOOK CONTEXT (use this to open the email with a real, personalized observation — quote a phrase, reference a product/initiative, or cite the regulatory clock that applies to them. Do NOT invent facts not present here):
"""
${hookContext}
"""

Pick ONE concrete detail from the hook context and open with it. Keep it tight.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: DRAFT_MODEL,
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt }],
        temperature: 0.7,
        max_tokens: 260,
        tools: [{
          type: "function",
          function: {
            name: "return_email",
            description: "Return the cold email draft",
            parameters: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string", description: "Plain text email body, line breaks preserved" },
              },
              required: ["subject", "body"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_email" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call");
    const { subject, body } = JSON.parse(toolCall.function.arguments);

    const { data: updated, error: updErr } = await supabase
      .from("leads")
      .update({ email_subject: subject, email_body: body, status: lead.status === "new" ? "drafted" : lead.status })
      .eq("id", lead_id)
      .select()
      .single();
    if (updErr) throw updErr;

    return new Response(JSON.stringify({ lead: updated }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-cold-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
