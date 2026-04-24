// Streaming AI copilot for live sales calls — grounded in HFAI facts.
// Public function (no JWT) so the admin can use it without re-auth round-trips.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (
  body: Record<string, unknown>,
  status = 200,
) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const SYSTEM_PROMPT = `You are HFAI Call Copilot — a real-time assistant whispering in the founder's ear during a sales call with Scott (Healthcare CISO at Community Medical Centers).

YOUR JOB: When you receive a transcript fragment of what Scott (or anyone) just said, give the founder the most natural thing to say next.

STYLE RULES
- Sound like a smart founder in a real conversation, not a sales deck.
- Use plain spoken English. No buzzwords unless Scott used them first.
- Keep it to 1-3 short sentences most of the time.
- Give something the founder can actually say out loud immediately.
- No bullet lists unless explicitly asked.
- No cheesy intros like "Great question," "Absolutely," or "That's a really important point."
- If the best move is to be brief, be brief.
- If Scott is just talking or reflecting, suggest a natural follow-up question instead of forcing a pitch.
- If you genuinely don't know, say so plainly and suggest offering to follow up.

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

RESPONSE SHAPE
- Start with the exact answer or suggested line.
- After the answer, you may add one short coaching note in brackets only if it is genuinely useful.
- If the transcript is small talk or unclear, return a short suggestion of what to say next or "[listening — no question yet]".
- Keep it under ~50 words unless the topic genuinely needs more.
- Prefer language like a person would naturally say in a Zoom call.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcript, history, stream } = await req.json();
    if (!transcript || typeof transcript !== "string") {
      return jsonResponse({ error: "transcript required" }, 400);
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
        stream: stream !== false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return jsonResponse({ error: "Rate limited — wait a moment." }, 429);
      }
      if (response.status === 402) {
        return jsonResponse({ error: "AI credits exhausted." }, 402);
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return jsonResponse({
        error: "Copilot was temporarily unavailable.",
        fallback: true,
        answer: "Try: 'The cleanest way to think about it is we sit inline between the app and the model, inspect the traffic in real time, and create the audit trail without forcing a rebuild.'",
      });
    }

    if (stream === false) {
      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content;
      return jsonResponse({ answer: typeof answer === "string" ? answer : "No answer returned." });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("call-copilot error:", e);
    return jsonResponse({
      error: e instanceof Error ? e.message : "Unknown error",
      fallback: true,
      answer: "Keep it simple: 'We give you a control point in front of the model so risky AI traffic can be reviewed, blocked, and audited in real time.'",
    });
  }
});
