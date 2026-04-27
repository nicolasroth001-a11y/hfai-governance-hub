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
- Open with a specific observation about their AI footprint or industry pressure — not a generic pitch
- One concrete value prop, not three
- One soft CTA (15-min call, not "let me know what you think")
- No emoji, no exclamation marks, no "I hope this email finds you well", no "I came across your company"
- Max 130 words body
- Sign as "Nicolas Roth, Founder, HFAI — hfa-i.org"

Subject lines: 4-7 words, no clickbait, regulatory or operational hook.

Return via function call only.`;

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

    const userPrompt = `Write a cold email to:
Company: ${lead.company_name}
Industry: ${lead.industry}
Contact: ${lead.contact_name || "(unknown)"} — ${lead.contact_title || "(unknown role)"}
AI use case: ${lead.ai_use_case}
Known pain points: ${lead.pain_points || "general AI governance gaps"}
Why HFAI fits: ${lead.rationale}
${custom_angle ? `Custom angle: ${custom_angle}` : ""}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: DRAFT_MODEL,
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt }],
        temperature: 0.7,
        max_tokens: 220,
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
