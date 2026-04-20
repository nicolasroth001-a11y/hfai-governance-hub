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

  const firstName = config.prospectName.split(" ")[0];

  // ============ COVER ============
  doc.setFillColor(10, 10, 10).rect(0, 0, W, H, "F");
  doc.setFillColor(196, 153, 58).rect(0, 0, 6, H, "F");
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(196, 153, 58);
  doc.text("HFAI × AESOP — DEMO SCRIPT", M, 90);
  doc.setFont("helvetica", "bold").setFontSize(28).setTextColor(255, 255, 255);
  doc.text(config.prospectName, M, 140);
  doc.setFont("helvetica", "normal").setFontSize(14).setTextColor(200, 200, 200);
  doc.text(`${config.prospectRole} · ${config.prospectCompany}`, M, 165);
  doc.setFontSize(11).setTextColor(160, 160, 160);
  doc.text(`Call: ${config.callDate} · Presenter: ${config.presenterName}`, M, 190);

  // Strategic frame on cover
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(196, 153, 58);
  doc.text("STRATEGIC FRAME", M, 240);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(220, 220, 220);
  const frame = [
    "Scott is NOT a normal prospect. He's a force multiplier:",
    "  • Founder of AESOP AI Academy (publishes EU AI Act + NIST RMF alignment)",
    "  • Healthcare CISO advisor with a network of clients",
    "  • Already living the regulations — does not need education",
    "",
    "DO NOT sell him software. Offer him a Governance Lab for AESOP.",
    "He will then sell HFAI to his network for you.",
  ];
  let fy = 262;
  frame.forEach((line) => {
    doc.text(line, M, fy);
    fy += 14;
  });

  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(196, 153, 58);
  doc.text("AGENDA (15–25 MIN)", M, 410);
  const agenda = [
    "1. Open · 60–90s — empathy, AESOP bridge, Calendly thank-you",
    "2. Discovery questions (slip in early, listen hard)",
    "3. Sign-up — self-serve, no gating",
    "4. API key & both-sides setup",
    "5. Reviewer team (Article 14)",
    "6. Connect AI system — one line",
    "7. Live events streaming in",
    `8. Violation BLOCKED: ${SCENARIO_LIBRARY[config.primaryScenario].label}`,
    "9. What the end user (the student) actually sees",
    "10. Human review + hash-chained audit",
    "11. Compliance dashboard (live)",
    "12. Generated Annex IV report (the artifact)",
    "13. The two-question close",
  ];
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(220, 220, 220);
  let ay = 432;
  agenda.forEach((a) => {
    doc.text(a, M, ay);
    ay += 15;
  });

  doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(140, 140, 140);
  doc.text("Hybrid script · verbatim opener + closing · bullet outlines · questions to ask Scott · objection library", M, H - 60);

  // ============ AESOP INTEL PAGE ============
  doc.addPage();
  y = M;
  h1("AESOP Intel — What He's Already Published");
  para("Read these BEFORE the call so you can quote him back to himself. Massive psychological win.", { muted: true, italic: true });
  divider();
  h2("Public alignment pages on aesopacademy.org");
  bullet("EU AI Act (Reg 2024/1689) — including Article 4 literacy mandate + GPAI obligations");
  bullet("NIST AI RMF 1.0 + Generative AI Profile (NIST AI 600-1)");
  bullet("AI4K12 Five Big Ideas framework");
  bullet("CSTA K-12 Computer Science Standards");
  bullet("ISTE Standards for Students (2024 refresh)");
  bullet("UNESCO AI competency framework");
  bullet("Published AI Policy: 'data, safety, oversight' — literally HFAI's three-word pitch");
  bullet("COPPA-compliant (under-13 learners) — child data is HIGH-RISK under EU AI Act Annex III §3");
  divider();
  h2("Strategic implications");
  para("• He has an EU AI Act page. Quote it. Then show him the live enforcement layer that makes those words real.");
  para("• He has a NIST RMF page. Tell him HFAI auto-generates evidence mapped to RMF GOVERN/MAP/MEASURE/MANAGE.");
  para("• His learners are minors. Lead with the COPPA + Annex III §3 scenario, not generic PHI.");
  para("• He uses the words 'data, safety, oversight'. Mirror that language. Don't invent new vocabulary.");

  // ============ OPENING (verbatim) ============
  doc.addPage();
  y = M;
  h1("Opening — Verbatim");
  para(`Goal: thank Scott for the public Calendly nudge, find the AESOP bridge, set the agenda, and get permission to share screen. 60–90 seconds total.`, { muted: true, italic: true });
  divider();
  h3("Word-for-word opener");
  verbatimBlock(`"${firstName} — really appreciate you flagging the Calendly hiccup publicly the other day. That actually moved this call up by a week, so genuinely thank you. Before I share my screen, I want to acknowledge something: I spent time on aesopacademy.org this week. The EU AI Act alignment page, the NIST RMF page, the AI Policy — that's not a school's website. That's a manifesto. So I want to flip the usual demo on its head. Instead of pitching, I want to show you what I think you've been describing in your curriculum, and then ask whether AESOP could be the first place this gets used as a live teaching lab. Sound good?"`);
  h3("If they say 'sounds good' (they will)");
  verbatimBlock(`"Perfect. 15 minutes max — sign-up to a real COPPA violation getting blocked in 9 milliseconds — then we open it up. If at any point you want me to stop and dig into something AESOP-specific or healthcare-specific, just jump in."`);

  // ============ DISCOVERY QUESTIONS — DEDICATED PAGE ============
  doc.addPage();
  y = M;
  h1("Questions to Ask Scott");
  para("Use these to listen, not to sell. Goal = surface the exact angle he cares about most. Pick 4–5, slip them in throughout the call.", { muted: true, italic: true });
  divider();

  h2("Tier 1 — AESOP / curriculum (the wedge)");
  bullet("\"What gap in current AI literacy curricula were you trying to solve when you started AESOP?\"");
  bullet("\"How are AESOP students learning what 'human oversight' or 'audit trail' actually look like in practice today — or is it mostly conceptual?\"");
  bullet("\"You publish EU AI Act + NIST RMF alignment pages. What was the moment you decided that mattered for a learning academy?\"");
  bullet("\"If AESOP students could run real governance against a real model in class — would faculty want that, or is that out of scope?\"");
  bullet("\"What's your enrollment trajectory? Do you see AESOP as US-focused or international from the start?\"");
  divider();

  h2("Tier 2 — Healthcare CISO advisory (the channel)");
  bullet("\"Of the healthcare orgs you advise, how many have an actual AI governance program vs. just a policy document?\"");
  bullet("\"When a CISO asks you 'what tool should I use for AI governance' — what do you tell them today?\"");
  bullet("\"How are your healthcare clients thinking about EU AI Act exposure if they touch any EU patient data?\"");
  bullet("\"What does the procurement timeline look like for a healthcare CISO buying a $300/mo SaaS tool — is it days or quarters?\"");
  divider();

  h2("Tier 3 — Personal motivation (build rapport)");
  bullet("\"What got you from CISO into building an AI literacy academy? Most people would have stopped at 'advisor'.\"");
  bullet("\"You wear two hats — what does a normal week look like for you between the academy and advisory work?\"");
  bullet("\"What would success look like for you on this call? I'd rather know upfront than guess.\"");
  divider();

  h2("Tier 4 — Direct ask (only after value is shown)");
  bullet("\"If I built an AESOP-branded sandbox tier — free for your students, real platform, optional co-branding — would that be a yes, or are there constraints I'm not seeing?\"");
  bullet("\"Is there one healthcare client in your network where what I just showed would be most urgent? I don't need an intro right now — just whether they exist.\"");
  bullet("\"What would have to be true for you to put HFAI on your AESOP standards-alignment page next to UNESCO and NIST?\"");

  // ============ PER-SCENE SCRIPTS ============
  const scenes = [
    {
      n: 3,
      title: "Sign-Up",
      onScreen: `${config.prospectCompany} signs up at hfa-i.org. Org provisioned in <1 second.`,
      bullets: [
        "Highlight: zero sales-call gating — they self-serve.",
        "\"This is exactly what an AESOP student could do in class. No IT ticket, no procurement.\"",
      ],
    },
    {
      n: 4,
      title: "API Key & Both-Sides Setup",
      onScreen: "HFAI proxy key issued. Left = customer env vars. Right = what HFAI provisions automatically.",
      bullets: [
        "Show the key. Show the env vars on the customer side.",
        "Right side: RLS-isolated tenant, default rule pack, audit chain initialized.",
        "\"You configure two env vars. We do the rest. This is the integration story your students could re-create in 5 minutes.\"",
      ],
    },
    {
      n: 5,
      title: "Reviewer Team (Article 14)",
      onScreen: "Customer adds in-house reviewers. HFAI Expert badge for Sovereign tier.",
      bullets: [
        "\"Article 14 mandates human oversight. For AESOP, that means: faculty as primary reviewers, an HFAI Expert as guest reviewer for student case studies.\"",
        "\"For your healthcare clients, that means: their compliance team, plus optional HFAI Expert with override authority — independent oversight regulators want to see.\"",
      ],
    },
    {
      n: 6,
      title: "Connect AI System",
      onScreen: "Before / After code snippet. One-line base URL change.",
      bullets: [
        "\"One line of code. We sit invisibly between the app and the model.\"",
        "Anticipate latency: \"12ms p99 — less than network jitter to OpenAI itself.\"",
        "\"For AESOP — students literally see what governance does without rewriting their app.\"",
      ],
    },
    {
      n: 7,
      title: "Live Events Streaming",
      onScreen: "Real-time event feed populates. Input + output captured, hash-chained.",
      bullets: [
        "Pause for effect — let him watch the realtime feed update.",
        "\"Every prompt, every response, every metadata field — captured. No PII or PHI in clear text.\"",
      ],
    },
    {
      n: 8,
      title: `Violation BLOCKED — ${SCENARIO_LIBRARY[config.primaryScenario].label}`,
      onScreen: `Pre-scripted prompt fires. ${SCENARIO_LIBRARY[config.primaryScenario].latency}ms later: BLOCKED. ${SCENARIO_LIBRARY[config.primaryScenario].euArticle}.`,
      bullets: [
        `Read the prompt aloud (an 11-year-old asking for homework help): "${SCENARIO_LIBRARY[config.primaryScenario].prompt}"`,
        `"In a normal stack, that response goes back. The AI casually echoes a minor's home address. Here:" — click → BLOCK in ${SCENARIO_LIBRARY[config.primaryScenario].latency}ms.`,
        "Switch scenarios live if Scott asks for healthcare PHI or EU AI Act prohibited practice — all 5 are loaded.",
      ],
    },
    {
      n: 9,
      title: "What the Student Sees",
      onScreen: "Chat-style view: graceful fallback message replaces blocked output. Reference number for follow-up.",
      bullets: [
        "\"This is what your AESOP student or a patient actually sees — no scary 'BLOCKED' banner. A graceful handoff with a reference number.\"",
        "\"Zero PII exposed. Zero liability. The user feels taken care of. The audit trail is complete.\"",
      ],
    },
    {
      n: 10,
      title: "Human Review (HITL)",
      onScreen: `${config.reviewerName} opens the violation, adds notes, decides. SHA-256 hash chain visible.`,
      bullets: [
        "Show the integrity hash. \"Tamper-evident — alter one, every subsequent hash breaks.\"",
        "\"For AESOP teaching: this is how a student SEES Article 14 working. For your healthcare clients: this is the artifact a QSA or OCR auditor wants.\"",
      ],
    },
    {
      n: 11,
      title: "Compliance Dashboard",
      onScreen: "Score gauge animates 78% → 84%. Stats panel shows live activity.",
      bullets: [
        "\"47 active rules. Live score that moves with every reviewed event.\"",
        "\"Imagine an AESOP class watching this in real time as they fire test prompts.\"",
      ],
    },
    {
      n: 12,
      title: "Generated Annex IV Report",
      onScreen: `Rendered PDF preview of the Annex IV technical documentation for ${config.aiSystemName}.`,
      bullets: [
        "\"This is the doc EU regulators will demand starting Aug 2026.\"",
        "\"For AESOP — this is the artifact you'd hand a student to show 'this is what compliance looks like as a deliverable, not a policy.'\"",
        "\"Most companies will scramble to write this in Word from memory. You generate it from real audit data, on demand.\"",
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
  h3("The transition");
  verbatimBlock(`"So that's end-to-end — sign-up to a blocked COPPA violation to audit-ready evidence, in under 15 minutes of real work. Two questions for you, ${firstName}:"`);
  h3("The two-question close");
  bullet("\"AESOP first — would your students benefit from running governance against real models in a live HFAI lab? I'm thinking AESOP-branded sandbox, free for learners, optional co-branding.\"");
  bullet("\"And separately — of the healthcare clients you're advising right now, is there one where this would be most urgent?\"");
  h3("If yes to AESOP partnership (PRIMARY GOAL)");
  verbatimBlock(`"Amazing. Let's do this: I'll set up an AESOP-branded sandbox tier this week — your students get free Sovereign-tier accounts, you get the real platform powering your curriculum. In exchange: HFAI joins your standards-alignment page next to UNESCO and NIST, and we co-author one short piece on operationalizing EU AI Act Article 4 in education. I'll send a one-pager Monday. Fair trade?"`);
  h3("If yes to healthcare client urgency (CHANNEL UPSIDE)");
  verbatimBlock(`"Great. I can have a Free Pilot live for them tomorrow — 30 days, no card required, full feature access. Want me to send the link to you to forward, or directly to your contact there?"`);
  h3("If 'let me think about it'");
  verbatimBlock(`"Totally fair. Last thing — the AESOP sandbox offer is genuinely zero-strings. Even if today is just 'cool, keep me posted', take 2 minutes after the call and self-provision a Free Pilot for AESOP. You'll have a working governance lab by tonight. Either way, I'd love to stay in touch on the curriculum side specifically."`);

  // ============ OBJECTION LIBRARY ============
  doc.addPage();
  y = M;
  h1("Objection Library — Likely Questions From Scott");
  para("Anticipated questions. Use the answers verbatim or adapt. Listed in order of likelihood for Scott specifically.", { muted: true, italic: true });
  divider();

  const objections = [
    {
      q: "How is HFAI different from what I already teach in the AESOP AI Policy?",
      a: "Your AI Policy describes the principles — data, safety, oversight. HFAI is the runtime layer that makes those principles enforceable in code. You teach what governance should look like; we make it happen at the API in 12 milliseconds. Together: theory + working lab.",
    },
    {
      q: "What about COPPA? My learners are under 13.",
      a: "That's exactly why I led with the under-13 scenario. HFAI auto-detects minor PII patterns (name + age signal + school email + address) and blocks echo/retention before the model output reaches the student. We map directly to COPPA §312.5 and EU AI Act Annex III §3 (education = high-risk).",
    },
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
      a: "Those are GRC platforms — they tell you what policies you should have. HFAI is the runtime enforcement layer. We sit at the API and actually block prohibited use as it happens, then feed evidence back into your GRC tool. We have webhook integrations with all three.",
    },
    {
      q: "How is this different from OpenAI's built-in moderation?",
      a: "OpenAI moderation flags content. HFAI enforces YOUR specific rules — HIPAA, COPPA, EU AI Act Article 5, your AUP — and gives you the audit trail regulators actually accept. We're model-agnostic too: same enforcement layer works for GPT, Claude, Gemini, and on-prem models.",
    },
    {
      q: "What's the deployment story? Self-hosted? Cloud-only?",
      a: "Cloud-hosted by default (us-east, eu-west regions). Sovereign tier offers single-tenant deployment for healthcare and gov clients. Roadmap includes on-prem Helm chart for Q2.",
    },
    {
      q: "How do I know your detection is actually accurate?",
      a: "Every rule is testable — you can fire synthetic events from the dashboard and see exactly what triggers. Every detection is reviewable by a human. Every override teaches the system. We're explicit about not being a black box. Perfect transparency for an AESOP curriculum.",
    },
    {
      q: "Pricing?",
      a: "Free Pilot: 30 days, full features, no card. Pro: $299/mo. Enterprise: $999/mo with priority support + custom rules. Sovereign: $499/mo for the external reviewer + isolated infrastructure tier. For AESOP I'm proposing a no-cost Sovereign tier in exchange for the standards-page mention — call it educational sponsorship.",
    },
    {
      q: "What's in it for you to give AESOP free Sovereign tier?",
      a: "Honesty: distribution. AESOP students become future CISOs, GRC engineers, AI program leads. If they learn governance ON HFAI, they recommend HFAI when they get jobs. Same playbook MongoDB, Stripe, and Notion ran. Plus: your standards page is high-authority — being listed there next to UNESCO and NIST is real validation for us.",
    },
    {
      q: "What does 'co-author one piece' commit me to?",
      a: "One short article — 1500 words max — on operationalizing EU AI Act Article 4 in education. We do 80% of the writing, you review and add the curriculum perspective. Co-bylined. We promote it on our channels, you promote it on yours. Total time commitment: maybe 2 hours.",
    },
    {
      q: "What's the sales process from here?",
      a: "Honestly — fastest path is you self-provision the Free Pilot today, fire 5–10 events from a sandbox, see if the detection matches what you'd expect for a learning environment. If it does, we move to the AESOP sandbox setup. If not, you've spent 20 minutes and learned something.",
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
    { name: "AESOP Sandbox", price: "$0 (proposed)", duration: "indefinite", who: "Sovereign-tier features, capped event volume per student account, in exchange for standards-page listing + co-authored content. Educational sponsorship — internal name only." },
  ];
  tiers.forEach((t) => {
    h3(`${t.name} — ${t.price}`);
    para(`${t.duration} · ${t.who}`);
  });

  divider();
  h2("Post-call action items");
  bullet("Send recap email within 2 hours — reference his AESOP standards page by name");
  bullet("If AESOP partnership discussed: send AESOP × HFAI one-pager by Monday");
  bullet("Send Free Pilot signup link with prefilled company name");
  bullet("Add Scott to CRM with next-touch date + 'Channel + Reference' tag");
  bullet("LinkedIn follow-up: thank him publicly for the call (he reciprocates publicly — established pattern)");

  doc.save(`HFAI-AESOP-Demo-Script-${config.prospectName.replace(/\s+/g, "-")}-${config.callDate}.pdf`);
}
