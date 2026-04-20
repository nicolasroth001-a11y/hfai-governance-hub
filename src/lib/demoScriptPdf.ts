import jsPDF from "jspdf";
import { SCENARIO_LIBRARY, type DemoConfig } from "./demoConfig";

const PRIMARY = "#c4993a"; // HFAI gold
const DARK = "#0a0a0a";
const MUTED = "#666666";

export function generateDemoScriptPDF(config: DemoConfig) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 50;
  let y = M;

  const ensureSpace = (needed: number) => {
    if (y + needed > H - M) {
      doc.addPage();
      y = M;
    }
  };

  const h1 = (text: string) => {
    ensureSpace(40);
    doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(DARK);
    doc.text(text, M, y);
    y += 28;
  };
  const h2 = (text: string) => {
    ensureSpace(28);
    doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(PRIMARY);
    doc.text(text.toUpperCase(), M, y);
    y += 18;
  };
  const h3 = (text: string) => {
    ensureSpace(20);
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(DARK);
    doc.text(text, M, y);
    y += 14;
  };
  const para = (text: string, opts: { italic?: boolean; muted?: boolean; indent?: number } = {}) => {
    const x = M + (opts.indent || 0);
    doc.setFont("helvetica", opts.italic ? "italic" : "normal").setFontSize(10).setTextColor(opts.muted ? MUTED : DARK);
    const lines = doc.splitTextToSize(text, W - M * 2 - (opts.indent || 0));
    lines.forEach((line: string) => {
      ensureSpace(14);
      doc.text(line, x, y);
      y += 12;
    });
    y += 4;
  };
  const bullet = (text: string) => {
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(DARK);
    const lines = doc.splitTextToSize(text, W - M * 2 - 14);
    ensureSpace(14 * lines.length);
    doc.text("•", M, y);
    lines.forEach((line: string, i: number) => {
      doc.text(line, M + 14, y);
      y += 12;
      if (i < lines.length - 1) ensureSpace(14);
    });
    y += 2;
  };
  const divider = () => {
    ensureSpace(20);
    doc.setDrawColor(220).setLineWidth(0.5).line(M, y, W - M, y);
    y += 16;
  };
  const verbatimBlock = (text: string) => {
    ensureSpace(40);
    const startY = y - 10;
    const lines = doc.splitTextToSize(text, W - M * 2 - 20);
    const blockH = lines.length * 13 + 16;
    doc.setFillColor(248, 246, 240).rect(M, startY, W - M * 2, blockH, "F");
    doc.setDrawColor(196, 153, 58).setLineWidth(2).line(M, startY, M, startY + blockH);
    doc.setFont("helvetica", "italic").setFontSize(10).setTextColor(DARK);
    let ty = startY + 14;
    lines.forEach((line: string) => {
      doc.text(line, M + 14, ty);
      ty += 13;
    });
    y = startY + blockH + 12;
  };

  // ============ COVER ============
  doc.setFillColor(10, 10, 10).rect(0, 0, W, H, "F");
  doc.setFillColor(196, 153, 58).rect(0, 0, 6, H, "F");
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(196, 153, 58);
  doc.text("HFAI — DEMO SCRIPT", M, 90);
  doc.setFont("helvetica", "bold").setFontSize(28).setTextColor(255, 255, 255);
  doc.text(config.prospectName, M, 140);
  doc.setFont("helvetica", "normal").setFontSize(14).setTextColor(200, 200, 200);
  doc.text(`${config.prospectRole} · ${config.prospectCompany}`, M, 165);
  doc.setFontSize(11).setTextColor(160, 160, 160);
  doc.text(`Call: ${config.callDate} · Presenter: ${config.presenterName}`, M, 190);

  // Mini agenda on cover
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(196, 153, 58);
  doc.text("AGENDA (15–30 MIN)", M, 260);
  const agenda = [
    "1. Open · 60–90s — empathy, AESOP bridge",
    "2. Sign-up — self-serve, no gating",
    "3. API key & both-sides setup",
    "4. Reviewer team (Article 14)",
    "5. Connect AI system — one line",
    "6. Live events streaming in",
    `7. Violation BLOCKED: ${SCENARIO_LIBRARY[config.primaryScenario].label}`,
    "8. What the end user actually sees",
    "9. Human review + hash-chained audit",
    "10. Compliance dashboard (live)",
    "11. Generated Annex IV report (the artifact)",
    "12. The two-question close",
  ];
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(220, 220, 220);
  let ay = 285;
  agenda.forEach((a) => {
    doc.text(a, M, ay);
    ay += 16;
  });

  doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(140, 140, 140);
  doc.text("Hybrid script · verbatim opening + closing · bullet outlines for live demo · objection answers", M, H - 60);

  // ============ OPENING (verbatim) ============
  doc.addPage();
  y = M;
  h1("Opening — Verbatim");
  para(`Goal: thank Scott for the public LinkedIn nudge, find the AESOP bridge, set the agenda, and get permission to share screen. 60–90 seconds total.`, { muted: true, italic: true });
  divider();
  h3("Word-for-word opener");
  verbatimBlock(`"${config.prospectName.split(" ")[0]} — really appreciate you flagging the Calendly hiccup publicly the other day. That actually moved this call up by a week, so thank you. Before I show you anything, I want to ask: your AESOP AI Academy work — preparing the next generation for AI literacy — that's exactly the gap we're trying to close on the enforcement side. So I'd love this to be a two-way conversation, not a pitch. Sound good?"`);
  h3("If they say 'sounds good' (they will)");
  verbatimBlock(`"Perfect. Here's what I'll do: 15 minutes max, end-to-end walkthrough — sign-up to a real PHI violation getting blocked in 12 milliseconds — then we open it up. If at any point you want me to stop and dig into something healthcare-specific, just jump in."`);
  h3("Discovery questions to slip in early");
  bullet("\"What's currently in place for AI governance at your healthcare clients?\" (listen for: nothing, manual review, OneTrust)");
  bullet("\"How are you thinking about the EU AI Act for US healthcare orgs operating in EU markets?\"");
  bullet("\"Are your AESOP students asking about real enforcement tools, or mostly theory right now?\"");

  // ============ PER-SCENE SCRIPTS ============
  const scenes = [
    {
      n: 2,
      title: "Sign-Up Flow",
      onScreen: `${config.prospectCompany} signing up at hfa-i.org. Email, password, company name auto-fills. Org provisioned in <1 second.`,
      bullets: [
        "Highlight: zero sales-call gating. They can self-serve.",
        "Mention: SOC 2 Type II infrastructure (Lovable Cloud).",
        "Drop: \"This is what your AESOP students could do in class — no IT ticket needed.\"",
      ],
    },
    {
      n: 3,
      title: "API Key & Connect",
      onScreen: `New org gets a unique HFAI proxy key (hfai_...) instantly. Drop-in replacement for OpenAI base URL.`,
      bullets: [
        "Show the key. Show the proxy URL.",
        "Key line: \"One line of code change. We sit invisibly between your app and the model.\"",
        "Anticipate: \"Does this add latency?\" → \"12ms p99. Less than the network jitter to OpenAI itself.\"",
      ],
    },
    {
      n: 4,
      title: "First Event Flows In",
      onScreen: "Live event feed — patient query streams in real-time. Input + output captured. No PHI persisted in clear text.",
      bullets: [
        "Pause for effect — let him see the realtime feed update.",
        "\"Every prompt, every response, every metadata field — captured and hash-chained.\"",
        "Don't dwell. Move to the wow moment.",
      ],
    },
    {
      n: 5,
      title: `Violation Detected — ${SCENARIO_LIBRARY[config.primaryScenario].label}`,
      onScreen: `Pre-scripted prompt fires. ${SCENARIO_LIBRARY[config.primaryScenario].latency}ms later: BLOCKED. Banner shows ${SCENARIO_LIBRARY[config.primaryScenario].euArticle} + ${SCENARIO_LIBRARY[config.primaryScenario].hipaaRef}.`,
      bullets: [
        `Read the prompt out loud: "${SCENARIO_LIBRARY[config.primaryScenario].prompt}"`,
        `"In a normal stack, that response goes to the user. Here:" — click → BLOCK animation in ${SCENARIO_LIBRARY[config.primaryScenario].latency}ms.`,
        `"This is ${SCENARIO_LIBRARY[config.primaryScenario].ruleTriggered} — and it's already mapped to both ${SCENARIO_LIBRARY[config.primaryScenario].euArticle} and ${SCENARIO_LIBRARY[config.primaryScenario].hipaaRef}."`,
        "If he asks about other scenarios — switch live to the scenario library and run a 2nd or 3rd.",
      ],
    },
    {
      n: 6,
      title: "Human Review (HITL)",
      onScreen: `${config.reviewerName} opens the violation, adds notes, makes a decision. Each review is SHA-256 hash-chained.`,
      bullets: [
        "Show the integrity hash. \"This is tamper-evident. If someone alters a past review, every subsequent hash breaks.\"",
        "\"For OCR audits, this is the artifact your QSA wants to see.\"",
        "Mention: HFAI also offers Sovereign-tier external reviewers — independent oversight when internal review isn't enough.",
      ],
    },
    {
      n: 7,
      title: "Compliance Dashboard + Annex IV Export",
      onScreen: `Compliance score updated live. One-click Annex IV doc generates as PDF for ${config.aiSystemName}.`,
      bullets: [
        "Show the score gauge updating.",
        "Click 'Generate Annex IV' — show the PDF appearing.",
        "\"This is the doc EU regulators will demand starting Aug 2026. Most companies will scramble to write it. You generate it on-demand from real data.\"",
      ],
    },
  ];

  scenes.forEach((scene) => {
    doc.addPage();
    y = M;
    h1(`Scene ${scene.n}: ${scene.title}`);
    h2("On-screen");
    para(scene.onScreen, { italic: true, muted: true });
    h2("Talking points");
    scene.bullets.forEach(bullet);
  });

  // ============ CLOSING (verbatim) ============
  doc.addPage();
  y = M;
  h1("Closing — Verbatim");
  h3("The transition")
  verbatimBlock(`"So that's end-to-end — sign-up to blocked PHI leak to audit-ready evidence, in under 15 minutes of real work. Two questions for you, ${config.prospectName.split(" ")[0]}:"`);
  h3("The two-question close");
  bullet("\"Of the healthcare clients you're advising right now — is there one where this would be most urgent?\"");
  bullet("\"And separately — your AESOP curriculum: would it be valuable to your students if HFAI sponsored a free tier for them to actually run governance against real models?\"");
  h3("If yes to client urgency");
  verbatimBlock(`"Great. I can have a Free Pilot live for them tomorrow — 30 days, no card required, full feature access. Want me to send the link to you to forward, or directly to your contact there?"`);
  h3("If yes to AESOP partnership");
  verbatimBlock(`"Even better. Let's do this: I'll set up an AESOP-branded sandbox tier — your students get free accounts, you get the real platform powering your curriculum. Co-branding optional, mutual win. Can I send a one-pager by Monday?"`);
  h3("If no / 'let me think about it'");
  verbatimBlock(`"Totally fair. Last thing — the Free Pilot is genuinely free, no demo required. If it would help to just have it sitting in the background for one of your clients, take 2 minutes after the call and self-provision. Either way, I'd love to stay in touch on the AESOP side specifically."`);

  // ============ OBJECTION LIBRARY ============
  doc.addPage();
  y = M;
  h1("Objection Library");
  para("Anticipated questions from a Healthcare CISO. Use the answers verbatim or adapt.", { muted: true, italic: true });
  divider();

  const objections = [
    {
      q: "Can you sign a BAA?",
      a: "Yes. Lovable Cloud (our infrastructure layer) is SOC 2 Type II and supports BAA execution. We never persist PHI in clear text — the audit trail uses hash-chained metadata, not raw patient data. Happy to walk through the architecture with your privacy officer.",
    },
    {
      q: "What about latency? We can't add 200ms to every AI call.",
      a: "P99 is 12 milliseconds. We're a thin proxy layer that runs detection in parallel with the upstream model call — not in serial. For the rare cases where we block, the user sees a graceful fallback in under 50ms total.",
    },
    {
      q: "We already use OneTrust / Drata / Vanta for compliance.",
      a: "Great — those are GRC platforms. They tell you what policies you should have. HFAI is the runtime enforcement layer. We sit at the API and actually block prohibited use as it happens, then feed evidence back into your GRC tool. We have webhook integrations with all three.",
    },
    {
      q: "How is this different from OpenAI's built-in moderation?",
      a: "OpenAI moderation flags content. HFAI enforces your specific rules — HIPAA, EU AI Act Article 5, your internal AUP — and gives you the audit trail regulators actually accept. We're model-agnostic too: same enforcement layer works for GPT, Claude, Gemini, and on-prem models.",
    },
    {
      q: "What's the deployment story? Self-hosted? Cloud-only?",
      a: "Cloud-hosted by default (us-east, eu-west regions). Sovereign tier offers single-tenant deployment in your VPC for healthcare and gov clients. Roadmap includes on-prem Helm chart for Q2.",
    },
    {
      q: "How do I know your detection is actually accurate?",
      a: "Every rule is testable — you can fire synthetic events from the dashboard and see exactly what triggers. Every detection is reviewable by a human. And every override teaches the system. We're explicit about not being a black box.",
    },
    {
      q: "Pricing?",
      a: "Free Pilot: 30 days, full features, no card. Pro: $299/mo (most healthcare clients land here). Enterprise: $999/mo with priority support + custom rules. Sovereign: $499/mo for the external reviewer + isolated infrastructure tier.",
    },
    {
      q: "What's the sales process from here?",
      a: "Honestly — the fastest path is you self-provision the Free Pilot today, fire 5–10 events from a sandbox, see if the detection matches what you'd expect for healthcare. If it does, we talk pilot-to-paid. If not, you've spent 20 minutes and learned something.",
    },
  ];

  objections.forEach((o) => {
    h3(`Q: ${o.q}`);
    para(`A: ${o.a}`);
    y += 6;
  });

  // ============ PRICING SHEET ============
  doc.addPage();
  y = M;
  h1("Pricing Reference");
  const tiers = [
    { name: "Free Pilot", price: "$0", duration: "30 days", who: "Self-serve, full features, no card. Perfect for evaluation." },
    { name: "Pro", price: "$299/mo", duration: "monthly", who: "Single org, up to 100K events/mo, standard support. Most healthcare clients." },
    { name: "Enterprise", price: "$999/mo", duration: "monthly or annual", who: "Up to 1M events/mo, priority support, custom rule packs, SAML SSO." },
    { name: "Sovereign", price: "$499/mo (add-on)", duration: "monthly", who: "External HFAI-appointed reviewer + isolated infrastructure. Required for some EU AI Act high-risk deployments." },
  ];
  tiers.forEach((t) => {
    h3(`${t.name} — ${t.price}`);
    para(`${t.duration} · ${t.who}`);
  });

  divider();
  h2("Post-call action items");
  bullet("Send recap email within 2 hours (template in Notion)");
  bullet("Send Free Pilot signup link with prefilled company name");
  bullet("If AESOP partnership discussed: send one-pager by Monday");
  bullet("Add to CRM with next-touch date");

  doc.save(`HFAI-Demo-Script-${config.prospectName.replace(/\s+/g, "-")}-${config.callDate}.pdf`);
}
