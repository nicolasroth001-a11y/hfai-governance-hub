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
    "1.  Open · 60–90s — empathy, AESOP bridge, Calendly thank-you",
    "2.  Discovery questions (slip in early, listen hard)",
    "3.  Sign-up — self-serve, no gating",
    "4.  API key & both-sides setup",
    "5.  Reviewer team (Article 14)",
    "6.  Connect AI system — one line",
    "7.  Live events streaming in",
    `8.  Violation BLOCKED: ${SCENARIO_LIBRARY[config.primaryScenario].label}`,
    "9.  What the end user (the student) actually sees",
    "10. Human review + hash-chained audit",
    "11. Compliance dashboard (live)",
    "12. Generated Annex IV report (the artifact)",
    "13. Industrial AI coverage — the 80% no other vendor governs",
    "14. The two-question close",
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
  verbatimBlock(`"Perfect. 15 minutes max — sign-up to a real COPPA violation getting blocked in 12 milliseconds — then we open it up. If at any point you want me to stop and dig into something AESOP-specific or healthcare-specific, just jump in."`);

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
      n: 1,
      title: "Sign-Up",
      onScreen: `${config.prospectCompany} signs up at hfa-i.org. Org provisioned in <1 second.`,
      bullets: [
        "Highlight: zero sales-call gating — they self-serve.",
        "\"This is exactly what an AESOP student could do in class. No IT ticket, no procurement.\"",
      ],
    },
    {
      n: 2,
      title: "API Key & Both-Sides Setup",
      onScreen: "HFAI proxy key issued. Left = customer env vars. Right = what HFAI provisions automatically.",
      bullets: [
        "Show the key. Show the env vars on the customer side.",
        "Right side: RLS-isolated tenant, default rule pack, audit chain initialized.",
        "\"You configure two env vars. We do the rest. This is the integration story your students could re-create in 5 minutes.\"",
      ],
    },
    {
      n: 3,
      title: "Reviewer Team (Article 14)",
      onScreen: "Customer adds in-house reviewers. HFAI Expert badge for Sovereign tier.",
      bullets: [
        "\"Article 14 mandates human oversight. For AESOP, that means: faculty as primary reviewers, an HFAI Expert as guest reviewer for student case studies.\"",
        "\"For your healthcare clients, that means: their compliance team, plus optional HFAI Expert with override authority — independent oversight regulators want to see.\"",
      ],
    },
    {
      n: 4,
      title: "Connect AI System",
      onScreen: "Before / After code snippet. One-line base URL change.",
      bullets: [
        "\"One line of code. We sit invisibly between the app and the model.\"",
        "Anticipate latency: \"12ms p99 — less than network jitter to OpenAI itself.\"",
        "\"For AESOP — students literally see what governance does without rewriting their app.\"",
      ],
    },
    {
      n: 5,
      title: "Live Events Streaming",
      onScreen: "Real-time event feed populates. Input + output captured, hash-chained.",
      bullets: [
        "Pause for effect — let him watch the realtime feed update.",
        "\"Every prompt, every response, every metadata field — captured. No PII or PHI in clear text.\"",
      ],
    },
    {
      n: 6,
      title: `Violation BLOCKED — ${SCENARIO_LIBRARY[config.primaryScenario].label}`,
      onScreen: `Pre-scripted prompt fires. ${SCENARIO_LIBRARY[config.primaryScenario].latency}ms later: BLOCKED. ${SCENARIO_LIBRARY[config.primaryScenario].euArticle}.`,
      bullets: [
        `Read the prompt aloud (an 11-year-old asking for homework help): "${SCENARIO_LIBRARY[config.primaryScenario].prompt}"`,
        `"In a normal stack, that response goes back. The AI casually echoes a minor's home address. Here:" — click → BLOCK in ${SCENARIO_LIBRARY[config.primaryScenario].latency}ms.`,
        "Switch scenarios live if Scott asks for healthcare PHI or EU AI Act prohibited practice — all 5 are loaded.",
      ],
    },
    {
      n: 7,
      title: "What the Student Sees",
      onScreen: "Chat-style view: graceful fallback message replaces blocked output. Reference number for follow-up.",
      bullets: [
        "\"This is what your AESOP student or a patient actually sees — no scary 'BLOCKED' banner. A graceful handoff with a reference number.\"",
        "\"Zero PHI exposed. Zero liability. The user feels taken care of. The audit trail is complete.\"",
      ],
    },
    {
      n: 8,
      title: "Human Review (HITL)",
      onScreen: `${config.reviewerName} opens the violation, adds notes, decides. SHA-256 hash chain visible.`,
      bullets: [
        "Show the integrity hash. \"Tamper-evident — alter one, every subsequent hash breaks.\"",
        "\"For AESOP teaching: this is how a student SEES Article 14 working. For your healthcare clients: this is the artifact a QSA or OCR auditor wants.\"",
      ],
    },
    {
      n: 9,
      title: "Compliance Dashboard",
      onScreen: "Score gauge animates 78% → 84%. Stats panel shows live activity.",
      bullets: [
        "\"47 active rules. Live score that moves with every reviewed event.\"",
        "\"Imagine an AESOP class watching this in real time as they fire test prompts.\"",
      ],
    },
    {
      n: 10,
      title: "Generated Annex IV Report",
      onScreen: `Rendered PDF preview of the Annex IV technical documentation for ${config.aiSystemName}.`,
      bullets: [
        "\"This is the doc EU regulators will demand starting Aug 2026.\"",
        "\"For AESOP — this is the artifact you'd hand a student to show 'this is what compliance looks like as a deliverable, not a policy.'\"",
        "\"Most companies will scramble to write this in Word from memory. You generate it from real audit data, on demand.\"",
      ],
    },
    {
      n: 11,
      title: "Industrial AI Coverage",
      onScreen: "Robotics, computer vision, predictive maintenance, autonomous units — with ISO 23482, IEC 61508, ISO 13849, and OSHA 1910 mapped out of the box.",
      bullets: [
        "\"Quick aside — because this is what every other governance vendor will skip.\"",
        "\"Same hash-chained oversight extended to the AI that touches the physical world. Factory robots, CV quality control, predictive maintenance, autonomous mobile units.\"",
        "\"A bad chatbot reply is embarrassing. A misclassified weld or missed proximity event is an OSHA filing — or a fatality.\"",
        "\"This is why HFAI works for an AI Academy and a manufacturer on the same control plane.\"",
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
      a: "Free tier: forever, 1 AI system, 5 rules, 7-day history. Starter: $19/mo (3 systems). Pro: $49.99/mo (unlimited systems + analytics + audit trail). Enterprise: $149.99/mo (root cause analysis, pattern detection, custom rule templates). Sovereign: $499/mo (compliance certificates, regulator export packs, multi-jurisdiction engine, dedicated advisor). All paid tiers include 30-day free trial. For AESOP I'm proposing a no-cost Sovereign tier in exchange for the standards-page mention — call it educational sponsorship.",
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
    { name: "Free", price: "$0", duration: "forever", who: "1 AI system, 5 rules, 7-day event history. No card. Self-serve." },
    { name: "Starter", price: "$19/mo", duration: "30-day free trial", who: "Up to 3 AI systems, violation detection & alerts, email notifications." },
    { name: "Pro", price: "$49.99/mo", duration: "30-day free trial", who: "Unlimited systems, advanced analytics, human review workflows, full audit trail. Most healthcare clients land here." },
    { name: "Enterprise", price: "$149.99/mo", duration: "30-day free trial", who: "Everything in Pro + AI-powered root cause analysis, remediation tracking, pattern detection, custom rule templates." },
    { name: "Sovereign", price: "$499/mo", duration: "30-day free trial", who: "Everything in Enterprise + compliance certificates, precedent intelligence, regulator-ready export packs, drift detection, multi-jurisdiction engine (EU/US/UK/CA), dedicated compliance advisor. Required for high-risk EU AI Act deployments." },
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

  // ============ COLLAB PLAYBOOK — PRESENTER EYES ONLY ============
  doc.addPage();
  // Dark cover band so it visually reads as "private / off-the-record"
  doc.setFillColor(10, 10, 10).rect(0, 0, W, 80, "F");
  doc.setFillColor(196, 153, 58).rect(0, 0, 6, 80, "F");
  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(196, 153, 58);
  doc.text("PRESENTER EYES ONLY · DO NOT SHARE", M, 35);
  doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(255, 255, 255);
  doc.text("If Scott Says Yes to Collab — The Playbook", M, 62);
  y = 110;

  para("This page is for you, not Scott. If he opens the door to a partnership in any form, here's the structured ladder of what to offer, in what order, and what to extract in return. Never reveal more than one rung at a time.", { muted: true, italic: true });
  divider();

  h2("Rung 1 — AESOP Sandbox (immediate, week 1)");
  bullet("Offer: AESOP-branded Sovereign-tier sandbox, free, indefinite. Capped at 1,000 events/student/month.");
  bullet("Ask: HFAI listed on the AESOP standards-alignment page next to UNESCO, NIST, ISTE.");
  bullet("Ask: One co-authored article (1500 words) on EU AI Act Art. 4 in education. Co-bylined.");
  bullet("Setup time: ~2 hours. Send him a one-pager Monday with terms in plain English. No legal MSA needed for v1 — handshake + email.");
  bullet("Internal accounting: zero revenue, mark as 'Educational Sponsorship — Distribution Channel' in CRM.");
  divider();

  h2("Rung 2 — Healthcare CISO referrals (weeks 2-8)");
  bullet("Offer: free 60-day Pro-tier pilots to any healthcare org Scott introduces. No card. White-glove onboarding from you personally.");
  bullet("Ask: warm intros only — never a list. Quality over quantity. Each intro = 1 emailed paragraph from Scott + you take it from there.");
  bullet("Comp model (optional, only if he raises it): 15% recurring revenue share for 12 months on any client he sources, or equivalent in HFAI Sovereign-tier credits for AESOP. Frame as 'thank you', not 'commission'.");
  bullet("Track each intro in CRM under 'Source: Scott Schindler' so attribution is unambiguous.");
  divider();

  h2("Rung 3 — Co-branded content & joint workshops (months 2-6)");
  bullet("Quarterly joint webinar — Scott teaches the policy, you demo the runtime. Both audiences get value, both lists grow.");
  bullet("HFAI sponsors one AESOP cohort scholarship per quarter ($1-2K) — symbolic, but signals long-term commitment.");
  bullet("Joint conference appearance: ISTE, NIST AI RMF events, EU AI Act compliance summits. Travel split 50/50.");
  bullet("White-paper series: 'Operationalizing AI Governance' — Scott's intro, your case studies, joint distribution.");
  divider();

  h2("Rung 4 — Strategic / equity-adjacent (only if both sides clearly want it)");
  bullet("Advisor agreement: Scott becomes formal HFAI Education Advisor. 0.25-0.5% advisor equity over 2-year vest, 4-hour/month commitment. Standard FAST agreement.");
  bullet("Curriculum licensing: AESOP licenses HFAI as the 'official runtime layer' for its certificate programs. Revenue share or fixed-fee, your call.");
  bullet("Joint product: an 'AESOP × HFAI Certified Reviewer' credential — students who complete the curriculum + pass an HFAI practicum become eligible to be paid HFAI Expert reviewers on the platform. Two-sided marketplace seeded.");
  bullet("Only float Rung 4 after Rungs 1-3 have produced measurable wins (3+ closed referrals, or 2+ joint pieces of content with measurable reach). Premature equity talk kills the relationship.");
  divider();

  h2("Red lines (don't cross)");
  bullet("Do NOT offer AESOP exclusivity in education — you want every AI academy on this. Frame AESOP as 'first', not 'only'.");
  bullet("Do NOT promise product roadmap items in writing. Verbal 'we're considering it' only.");
  bullet("Do NOT give away Sovereign-tier features to AESOP students that aren't in the actual product yet (no hand-built bespoke for one user).");
  bullet("Do NOT tie compensation to outcomes you can't track (e.g., 'mentions on LinkedIn'). Track concrete events: signups, intros, content published.");
  divider();

  h2("Decision tree — what to say in the moment");
  para("If Scott says 'I love the idea, what's next?' → Rung 1 only. Send the one-pager Monday. Don't volunteer Rung 2 unless he asks about clients.");
  para("If Scott says 'I have a few clients in mind' → Acknowledge, then move to Rung 2. Get him to name one specific org. Offer the Pro pilot. Don't discuss revenue share unless he raises money.");
  para("If Scott says 'how do you make money on this?' → Honest: distribution + brand validation. AESOP = top-of-funnel for the next generation of CISOs and compliance leads. Then ask: 'Would a small per-referral arrangement make this easier for you to bring me into client conversations?' (Rung 2 comp.)");
  para("If Scott says 'I'd want to be more involved long-term' → Pause. Say: 'Let's prove value first. If after 90 days you're still excited, let's talk about a formal advisor role.' That's Rung 4 setup without committing.");
  divider();

  h2("Followup cadence after the call");
  bullet("T+2h: recap email (already drafted — see Demo Cockpit 'Open recap in mail').");
  bullet("T+24h: LinkedIn connect + thank him publicly in a post that tags him.");
  bullet("T+72h: AESOP × HFAI one-pager, even if he didn't explicitly say yes — 'thinking about this more, here's what it could look like'.");
  bullet("T+7d: check in. If silent, send the latest blog post or news clip about EU AI Act enforcement — keep urgency live without selling.");
  bullet("T+30d: regardless of outcome, share one specific piece of value (intro, article, data point). Stay top of mind for 12 months minimum.");

  doc.save(`HFAI-AESOP-Demo-Script-${config.prospectName.replace(/\s+/g, "-")}-${config.callDate}.pdf`);
}
