// Streaming AI copilot for live sales calls — grounded in HFAI facts.
// Public function (no JWT) so the admin can use it without re-auth round-trips.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are HFAI Call Copilot — a real-time assistant whispering in the founder's ear during a sales call with Scott (Healthcare CISO at Community Medical Centers).

YOUR JOB: When you receive a transcript fragment of what Scott (or anyone) just said, give the founder a CRISP, SPOKEN-READY answer in 2-4 short sentences. Write it like the founder would say it out loud — confident, conversational, no bullet lists unless explicitly asked.

GROUND TRUTH ABOUT HFAI (use these facts, never invent):

PERFORMANCE
- Fast-path safety checks (regex + EU AI Act Article 5 prohibited practices): <50ms, runs synchronously before AI evaluation
- Block decisions end-to-end: typically 40–120ms
- Slow-path AI rule evaluation (Gemini-based): ~200–500ms, runs asynchronously so production traffic is never gated on AI latency
- Dual-path architecture: synchronous block + async deeper analysis

ENFORCEMENT
- Three modes per rule: Monitor (log only), Warn (flag + allow), Block (reject + graceful fallback)
- EU AI Act Article 5 prohibited practices are hardcoded — cannot be disabled

INTEGRATION (no vendor lock-in)
- Auto-Connect Proxy: drop-in base URL change for OpenAI, Anthropic, Gemini — one-line swap
- REST API: explicit ingest-event endpoint
- Supported providers: OpenAI, Anthropic Claude, Google Gemini

AUDIT & COMPLIANCE
- Tamper-evident audit trail: SHA-256 hash chain on every human review
- Frameworks: EU AI Act (Articles 4–73), US NIST AI RMF, ISO 42001
- Full immutable event + review history per org, multi-tenant RLS isolation

HUMAN OVERSIGHT (Article 14)
- Company-assigned reviewers with configurable permissions
- HFAI-appointed backup reviewers (Sovereign tier) with override authority
- Contextual friction: reviewers see full payload, AI diagnosis, suggested rules

SECURITY
- Multi-tenant Postgres RLS isolation on every table
- TOTP MFA available
- HMAC-SHA256 signed webhooks
- Lovable Cloud infrastructure: SOC 2 Type II, BAA support available
- PHI never persisted in clear text; audit trail is hash-chained metadata only

PRICING
- Free Pilot: $0 for 30 days
- Starter: $10/mo
- Pro: $49.99/mo (advanced analytics + HITL workflows)
- Enterprise: custom
- Sovereign: $499/mo (includes HFAI-appointed backup reviewer)

AI STACK
- RCA + rule evaluation via Lovable AI Gateway (Gemini 2.5 Flash/Pro) — no customer API key needed
- Hybrid AI diagnosis + human notes, generates remediation actions

POSITIONING FOR SCOTT
- Healthcare CISO at Community Medical Centers — clinical AI surface area: ambient scribes, CDS, patient chatbots, radiology AI
- Pain points: HIPAA + CMIA exposure, audit defensibility, shadow AI in clinical workflows, medical staff committee fit
- Today's call goal: relationship building, not a hard pilot ask. Plant seeds.

HOW TO RESPOND
- Start with the answer, not preamble. No "Great question."
- If Scott asks something you genuinely don't know, say so honestly and suggest the founder offer to follow up.
- If the transcript is small talk or unclear, return a short suggestion of what to say next or "[listening — no question yet]".
- Keep it under ~60 words unless the topic genuinely demands more.
- When relevant, end with one strategic follow-up question the founder could ask Scott to deepen the conversation.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcript, history } = await req.json();
    if (!transcript || typeof transcript !== "string") {
      return new Response(JSON.stringify({ error: "transcript required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(history) ? history.slice(-6) : []),
      {
        role: "user",
        content: `Live transcript fragment from the call:\n"""${transcript}"""\n\nWhat should the founder say or know right now?`,
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — wait a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("call-copilot error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
