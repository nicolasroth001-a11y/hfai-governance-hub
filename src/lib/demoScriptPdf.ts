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
  const company = config.prospectCompany;

  // ============ COVER ============
  doc.setFillColor(10, 10, 10).rect(0, 0, W, H, "F");
  doc.setFillColor(196, 153, 58).rect(0, 0, 6, H, "F");
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(196, 153, 58);
  doc.text(`HFAI × ${company.toUpperCase()} — DEMO SCRIPT`, M, 90);
  doc.setFont("helvetica", "bold").setFontSize(28).setTextColor(255, 255, 255);
  doc.text(config.prospectName, M, 140);
  doc.setFont("helvetica", "normal").setFontSize(14).setTextColor(200, 200, 200);
  doc.text(`${config.prospectRole} · ${company}`, M, 165);
  doc.setFontSize(11).setTextColor(160, 160, 160);
  doc.text(`Call: ${config.callDate} · Presenter: ${config.presenterName}`, M, 190);

  // Strategic frame on cover
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(196, 153, 58);
  doc.text("STRATEGIC FRAME", M, 240);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(220, 220, 220);
  const frame = [
    `Scott is the Healthcare CISO at ${company} — Central Valley health system,`,
    "~3 hospitals, ~7,000 employees, real HIPAA + CMIA exposure.",
    "",
    "  • Decision-maker (or one seat away) for AI governance procurement",
    "  • Already lives the regulations — does NOT need education on HIPAA, OCR, or NIST",
    "  • Real budget, real BAA process, real medical staff committee",
    "  • Buyer for: ambient scribes, CDS, patient chatbots, radiology AI, prior-auth automation",
    "",
    "DO NOT pitch features. Show him the OCR-defensible artifact",
    "his current vendors cannot produce.",
  ];
  let fy = 262;
  frame.forEach((line) => {
    doc.text(line, M, fy);
    fy += 14;
  });

  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(196, 153, 58);
  doc.text("AGENDA (15–25 MIN)", M, 430);
  const agenda = [
    "1.  Open · 60–90s — empathy, CMC clinical-AI bridge, Calendly thank-you",
    "2.  Discovery questions (slip in early, listen hard)",
    "3.  Sign-up — self-serve, no gating",
    "4.  API key & both-sides setup",
    "5.  Reviewer team (Article 14 / medical staff committee mapping)",
    "6.  Connect AI system — one line",
    "7.  Live events streaming in",
    `8.  Violation BLOCKED: ${SCENARIO_LIBRARY[config.primaryScenario].label}`,
    "9.  What the patient or clinician actually sees",
    "10. Human review + hash-chained audit (the OCR artifact)",
    "11. Compliance dashboard (live)",
    "12. Generated Annex IV / HIPAA evidence pack",
    "13. Industrial AI coverage — the 80% no other vendor governs",
    "14. The two-question close",
  ];
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(220, 220, 220);
  let ay = 452;
  agenda.forEach((a) => {
    doc.text(a, M, ay);
    ay += 15;
  });

  doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(140, 140, 140);
  doc.text("Hybrid script · verbatim opener + closing · bullet outlines · questions to ask Scott · objection library", M, H - 60);

  // ============ CMC INTEL PAGE ============
  doc.addPage();
  y = M;
  h1(`${company} Intel — What He's Actually Dealing With`);
  para("Read these BEFORE the call so you can speak his world, not yours. Massive credibility win.", { muted: true, italic: true });
  divider();
  h2(`${company} — what we know`);
  bullet("Central Valley California health system — Fresno-area, ~3 hospitals (CRMC, Clovis Community, Fresno Heart & Surgical), ~7,000 employees");
  bullet("CMIA (CA Confidentiality of Medical Information Act) layered on top of HIPAA — stricter than HIPAA on patient consent for any secondary AI use of records");
  bullet("Joint Commission accredited — AI-related sentinel event reporting falls under their oversight");
  bullet("Likely vendors in play: Epic (EHR), Nuance DAX or Abridge (ambient scribe), Epic Cognitive Computing / Aidoc (radiology), Notable / Olive (prior-auth)");
  bullet("Insurer / malpractice carrier almost certainly asking about AI governance posture in the 2024-2025 renewal cycle");
  bullet("California AB 3030 (effective Jan 2025) requires disclaimers when generative AI communicates with patients about clinical info — direct enforcement risk");
  divider();
  h2("What keeps a healthcare CISO up at night");
  para("• Ambient scribe drift: a SOAP note that subtly hallucinates — discovered during a malpractice deposition.");
  para("• Patient chatbot giving off-label medication advice or missing a stroke-symptom red flag.");
  para("• Shadow AI: clinicians pasting PHI into ChatGPT to draft letters — already happening, no audit trail.");
  para("• OCR breach investigation request: 'Show me every AI decision that touched this patient' — and you have a 6-month forensic project ahead of you.");
  para("• Plaintiff's attorney subpoena for 'all model versions, prompts, and outputs' on a contested chart.");
  divider();
  h2("Strategic implications for the call");
  para("• Lead with the OCR / plaintiff-attorney scenario, not 'compliance dashboard'. Pain first.");
  para("• Map every HFAI feature to a control he already owns: Article 14 ↔ medical staff committee, RCA ↔ peer review, hash chain ↔ legal hold.");
  para("• Don't say 'EU AI Act' first. Say 'HIPAA Security Rule §164.312 audit controls' and let HIM bring up EU AI Act if his system touches EU patients.");
  para("• When pricing comes up: anchor on cost of one OCR settlement ($4.3M average for healthcare per IBM 2024). Sovereign tier is a rounding error.");

  // ============ OPENING (verbatim) ============
  doc.addPage();
  y = M;
  h1("Opening — Verbatim");
  para(`Goal: thank Scott for the public Calendly nudge, anchor on the ${company} clinical-AI surface area, set the agenda, and get permission to share screen. 60–90 seconds total.`, { muted: true, italic: true });
  divider();
  h3("Word-for-word opener");
  verbatimBlock(`"${firstName} — really appreciate you flagging the Calendly hiccup publicly the other day. That actually moved this call up by a week, so genuinely thank you. Before I share my screen, I want to be honest about why I think this conversation matters: ${company} runs in a state where CMIA is stricter than HIPAA, you've got real ambient-scribe and clinical-AI exposure, and AB 3030 just kicked in. So instead of a generic governance pitch, I want to show you the artifact your malpractice carrier and OCR will actually ask for — and then ask which of your AI workflows is closest to a regulator-visible incident today. Sound good?"`);
  h3("If they say 'sounds good' (they will)");
  verbatimBlock(`"Perfect. 15 minutes max — sign-up to a real PHI-exposure scenario getting blocked in 12 milliseconds, then the audit trail OCR would actually accept. If at any point you want me to stop and dig into a specific ${company} workflow — ambient scribe, CDS, patient chatbot, radiology — just jump in."`);

  // ============ DISCOVERY QUESTIONS — DEDICATED PAGE ============
  doc.addPage();
  y = M;
  h1("Questions to Ask Scott");
  para("Use these to listen, not to sell. Goal = surface the exact AI workflow he's most exposed on. Pick 4–5, slip them in throughout the call.", { muted: true, italic: true });
  divider();

  h2("Tier 1 — Clinical AI surface area (the wedge)");
  bullet(`"Of the AI tools live or piloting at ${company} today — ambient scribe, CDS, patient chatbot, radiology AI, prior-auth — which one is your current biggest exposure?"`);
  bullet("\"How are you logging model decisions today? Is it Epic's audit log, the vendor's portal, or are you blind below the API?\"");
  bullet("\"Who on your medical staff committee actually reviews AI-generated content — and how often does that happen vs. the policy version?\"");
  bullet("\"Has your malpractice carrier started asking AI-governance questions in renewal — and if so, what specifically?\"");
  bullet("\"Are clinicians at CMC pasting PHI into ChatGPT or Claude to draft notes? Honest answer.\"");
  divider();

  h2("Tier 2 — OCR & legal posture (the urgency)");
  bullet("\"Have you done a tabletop exercise on an OCR investigation that includes AI-generated content? What broke?\"");
  bullet("\"If a plaintiff attorney subpoenas every model decision that touched a contested chart, how long does that response take today — days or quarters?\"");
  bullet("\"How is CMC handling AB 3030 disclaimers — at the application layer, the model layer, or post-hoc audit?\"");
  bullet("\"What does your incident response runbook say when an ambient scribe hallucinates into a chart that's already been billed?\"");
  divider();

  h2("Tier 3 — Procurement & decision velocity (the path to yes)");
  bullet("\"Walk me through who would need to bless a $500/month tool that touches AI workflows — security, privacy, IT, medical staff?\"");
  bullet("\"Is this a CapEx or OpEx decision at CMC? And does the threshold matter for procurement velocity?\"");
  bullet("\"What's your BAA turnaround typically? Are we talking 2 weeks or 3 months?\"");
  bullet("\"What would have to be true at day 30 of a pilot for you to take this to your IT council?\"");
  divider();

  h2("Tier 4 — Direct ask (only after value is shown)");
  bullet(`"If I set up a 30-day Free Pilot for one ${company} AI workflow this week — full Sovereign tier, no card, no procurement gate — which workflow would you point it at first?"`);
  bullet("\"At day 30, who would you want in the room for a readout — you, CMIO, Chief Compliance, all three?\"");
  bullet("\"What's the smallest signal that would make you say 'yes, let's run this against a second workflow'?\"");

  // ============ PER-SCENE SCRIPTS ============
  const scenes = [
    {
      n: 1,
      title: "Sign-Up",
      onScreen: `${company} signs up at hfa-i.org. Org provisioned in <1 second.`,
      bullets: [
        "Highlight: zero sales-call gating — they self-serve.",
        `"This is the velocity ${company} would actually need. No IT ticket, no procurement, no 90-day POC paperwork to get a working baseline."`,
      ],
    },
    {
      n: 2,
      title: "API Key & Both-Sides Setup",
      onScreen: "HFAI proxy key issued. Left = customer env vars. Right = what HFAI provisions automatically.",
      bullets: [
        "Show the key. Show the env vars on the customer side.",
        "Right side: RLS-isolated tenant, default HIPAA + CMIA + EU AI Act rule pack, hash-chained audit chain initialized.",
        `"You configure two env vars. We do the rest. For ${company}, your IT integration team would treat this exactly like adding a new logging endpoint."`,
      ],
    },
    {
      n: 3,
      title: "Reviewer Team (Article 14 / Medical Staff Committee)",
      onScreen: "Customer adds in-house reviewers. HFAI Expert badge available on Sovereign tier.",
      bullets: [
        `"For ${company}, this maps directly onto your existing medical staff committee structure. Primary reviewers: your CMIO, Chief Compliance, Privacy Officer. Secondary: clinical leads per service line."`,
        "\"Sovereign tier adds an HFAI Expert reviewer with override authority — independent oversight your carrier and Joint Commission want to see documented.\"",
        "\"Article 14 of the EU AI Act is essentially the medical staff peer review model you already run, applied to AI. We just give you the audit-grade workflow.\"",
      ],
    },
    {
      n: 4,
      title: "Connect AI System",
      onScreen: "Before / After code snippet. One-line base URL change.",
      bullets: [
        "\"One line of code. We sit invisibly between the app and the model.\"",
        "Anticipate latency: \"12ms p99 — less than network jitter to OpenAI itself. Clinicians will not notice.\"",
        `"For an ambient scribe vendor like Nuance or Abridge, your IT team adds one base-URL override. The vendor never touches HFAI directly — ${company} owns the governance layer."`,
      ],
    },
    {
      n: 5,
      title: "Live Events Streaming",
      onScreen: "Real-time event feed populates. Input + output captured, hash-chained.",
      bullets: [
        "Pause for effect — let him watch the realtime feed update.",
        "\"Every prompt, every model response, every metadata field — captured. PHI is never persisted in clear text; the audit trail is hash-chained metadata.\"",
        "\"This is what you'd hand an OCR investigator on day one of a breach inquiry.\"",
      ],
    },
    {
      n: 6,
      title: `Violation BLOCKED — ${SCENARIO_LIBRARY[config.primaryScenario].label}`,
      onScreen: `Pre-scripted prompt fires. ${SCENARIO_LIBRARY[config.primaryScenario].latency}ms later: BLOCKED. ${SCENARIO_LIBRARY[config.primaryScenario].euArticle}.`,
      bullets: [
        `Read the scenario aloud: "${SCENARIO_LIBRARY[config.primaryScenario].prompt}"`,
        `"In a normal stack, that response goes back. The AI casually exposes PHI or gives off-label medical advice. Here:" — click → BLOCK in ${SCENARIO_LIBRARY[config.primaryScenario].latency}ms.`,
        `"Switch scenarios live if Scott asks for a specific ${company} workflow — ambient scribe hallucination, CDS over-confidence, patient chatbot triage failure — all 5 are loaded."`,
      ],
    },
    {
      n: 7,
      title: "What the Patient or Clinician Sees",
      onScreen: "Chat-style view: graceful fallback message replaces blocked output. Reference number for follow-up.",
      bullets: [
        "\"This is what your patient or clinician actually sees — no scary 'BLOCKED' banner, no exposed PHI. A graceful handoff with a reference number that routes back to your team.\"",
        "\"Zero PHI exposed. Zero malpractice surface added. The clinician feels supported. The audit trail is complete.\"",
      ],
    },
    {
      n: 8,
      title: "Human Review (HITL)",
      onScreen: `${config.reviewerName} opens the violation, adds notes, decides. SHA-256 hash chain visible.`,
      bullets: [
        "Show the integrity hash. \"Tamper-evident — alter one entry, every subsequent hash breaks. This is the cryptographic property OCR investigators and forensic experts can actually verify.\"",
        `"For ${company}: this is what you hand to your malpractice carrier when they ask 'show me your AI oversight evidence.' Not a CSV log. Not a screenshot. A cryptographic chain."`,
      ],
    },
    {
      n: 9,
      title: "Compliance Dashboard",
      onScreen: "Score gauge animates 78% → 84%. Stats panel shows live activity.",
      bullets: [
        "\"47 active rules — HIPAA Security Rule controls, CMIA consent flags, EU AI Act Article 5 prohibited practices, AB 3030 disclaimer enforcement.\"",
        `"Live score that moves with every reviewed event. Imagine your medical staff committee opening this monthly instead of a 40-page PDF nobody reads."`,
      ],
    },
    {
      n: 10,
      title: "Generated Annex IV / HIPAA Evidence Pack",
      onScreen: `Rendered PDF preview of the technical documentation for ${config.aiSystemName}.`,
      bullets: [
        "\"This is the doc EU regulators will demand starting Aug 2026 — and it's also the artifact your OCR investigator will ask for tomorrow if you have an incident today.\"",
        `"For ${company}: imagine your privacy officer being able to generate this on-demand at the moment of a breach inquiry, instead of triggering a 6-month forensic project."`,
        "\"Most healthcare orgs will scramble to write this in Word from memory. You generate it from real audit data — the same data the hash chain proves is unaltered.\"",
      ],
    },
    {
      n: 11,
      title: "Industrial AI Coverage",
      onScreen: "Robotics, computer vision, predictive maintenance, autonomous units — with ISO 23482, IEC 61508, ISO 13849, and OSHA 1910 mapped out of the box.",
      bullets: [
        "\"Quick aside — because hospitals increasingly have AI on the physical side too: surgical robotics, automated medication dispensing, autonomous delivery bots, computer-vision QC on sterile processing.\"",
        "\"Same hash-chained oversight extended to that AI. A misclassified surgical tool ID or a missed proximity event in pharmacy automation is an FDA filing — or worse.\"",
        "\"This is why HFAI works for a clinical chatbot and a Da Vinci surgical robot on the same control plane.\"",
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
  verbatimBlock(`"So that's end-to-end — sign-up to a blocked PHI-exposure scenario to OCR-defensible evidence, in under 15 minutes of real work. Two questions for you, ${firstName}:"`);
  h3("The two-question close");
  bullet(`"First — of the AI workflows live or piloting at ${company} today, which one is closest to a regulator-visible incident? That's the one I'd point a 30-day Free Pilot at this week."`);
  bullet("\"Second — who on your team owns the audit-trail conversation when OCR or your malpractice carrier calls? I'd want them in the day-30 readout.\"");
  h3("If yes to a pilot (PRIMARY GOAL)");
  verbatimBlock(`"Amazing. Here's what I'll do: I'll set up a 30-day Free Pilot for ${company} this week — full Sovereign-tier features, no card, BAA executed within 5 business days. We point it at the workflow you named. At day 30 we do a 30-minute readout with you and whoever you want in the room. If it's earned its place, we move to a paid engagement. If not, you walk away with a working governance baseline you can point any vendor at. Fair?"`);
  h3("If yes to identifying the audit-trail owner (CHANNEL UPSIDE)");
  verbatimBlock(`"Great. Want me to send a one-paragraph intro you can forward to them, or would you rather walk them through it yourself? I'm comfortable either way."`);
  h3("If 'let me think about it'");
  verbatimBlock(`"Totally fair. Last thing — the 30-day pilot is genuinely zero-strings. Even if today is just 'cool, keep me posted', take 2 minutes after the call and self-provision it for ${company}. You'll have a working governance baseline by tonight. Either way, I'd love to stay in touch as AB 3030 enforcement ramps."`);

  // ============ OBJECTION LIBRARY ============
  doc.addPage();
  y = M;
  h1("Objection Library — Likely Questions From Scott");
  para("Anticipated questions. Use the answers verbatim or adapt. Listed in order of likelihood for a healthcare CISO specifically.", { muted: true, italic: true });
  divider();

  const objections = [
    {
      q: "Can you sign a BAA?",
      a: "Yes. Lovable Cloud (our infrastructure layer) is SOC 2 Type II and supports BAA execution. We never persist PHI in clear text — the audit trail uses SHA-256 hash-chained metadata, not raw patient data. Happy to walk through the architecture with your privacy officer this week and get a BAA in your hands within 5 business days.",
    },
    {
      q: "How does this work with Epic? We're not replacing the EHR.",
      a: "We don't touch Epic. We sit between your AI vendors (Nuance, Abridge, Aidoc, Notable, etc.) and the model APIs they call. Epic remains the system of record. We're the governance layer for the AI surface area Epic doesn't audit for you — ambient scribes, CDS, patient chatbots, radiology models, prior-auth automation.",
    },
    {
      q: "What about CMIA? California is stricter than HIPAA.",
      a: "Exactly why we surface CMIA-specific consent flags as first-class rules, not buried in policy. Every event is tagged with the CMIA consent basis, every secondary use is logged separately from primary care, and the audit trail satisfies the heightened CMIA documentation standard. We can demo a CMIA-specific scenario right now if useful.",
    },
    {
      q: "AB 3030 just went live. How do you handle the disclaimer requirement?",
      a: "Two layers. One: a hard rule that blocks any patient-facing generative response that doesn't carry the AB 3030 disclaimer. Two: a passive audit log proving every response that DID go out had the disclaimer attached. So you have both real-time enforcement and post-hoc evidence — exactly what the AG's office will ask for in an enforcement action.",
    },
    {
      q: "We already use OneTrust / Drata / Vanta for compliance.",
      a: "Those are GRC platforms — they tell you what policies you should have. HFAI is the runtime enforcement layer for AI specifically. We sit at the API and actually block prohibited use as it happens, then feed evidence back into your GRC tool. We have webhook integrations with all three, so HFAI events flow into your existing OneTrust dashboards.",
    },
    {
      q: "What about latency? Clinicians won't tolerate adding seconds to a workflow.",
      a: "P99 is 12 milliseconds. We're a thin proxy that runs detection in parallel with the upstream model call — not in serial. For the rare cases where we block, the user sees a graceful fallback in under 50ms total. No clinician will perceive the difference; we've measured this against ambient scribe workflows specifically.",
    },
    {
      q: "How is this different from OpenAI's built-in moderation or Microsoft's Azure AI Content Safety?",
      a: "Those flag content. HFAI enforces YOUR specific rules — HIPAA Security Rule §164.312, CMIA consent, EU AI Act Article 5, AB 3030, your medical staff committee policies — and gives you the cryptographic audit trail OCR investigators actually accept. We're also model-agnostic: same enforcement layer works for GPT, Claude, Gemini, Llama, and on-prem models. So when ${"your vendor mix"} changes, your governance doesn't.",
    },
    {
      q: "What's the deployment story? Self-hosted? Cloud-only?",
      a: "Cloud-hosted by default (us-east, eu-west regions). Sovereign tier offers single-tenant deployment for healthcare clients who require it. Roadmap includes on-prem Helm chart for Q2 — we already have one healthcare prospect requesting that for a single-tenant Epic-adjacent deployment.",
    },
    {
      q: "How accurate is your detection? False positives are operationally expensive in clinical workflows.",
      a: "Every rule is testable — your team can fire synthetic events from the dashboard and see exactly what triggers. We also support a 'monitor mode' for any rule, so you can run it for 2 weeks against real traffic, see the precision/recall, and only then promote it to 'block mode'. Nothing forces you into hard enforcement until you've proven the rule on YOUR data.",
    },
    {
      q: "Pricing?",
      a: "Free tier: forever, 1 AI system, 5 rules, 7-day history. Starter: $19/mo. Pro: $49.99/mo (unlimited systems + analytics + audit trail). Enterprise: $149.99/mo (root cause analysis, pattern detection, custom rule templates). Sovereign: $499/mo (compliance certificates, regulator export packs, multi-jurisdiction engine, dedicated advisor — what most health systems land on). All paid tiers include 30-day free trial. For ${company} I'd put you on Sovereign for the pilot at no cost for 30 days, then we right-size based on event volume.",
    },
    {
      q: "We have a long procurement cycle. Even a 30-day pilot needs security review.",
      a: "Understood — that's true at every health system. Three things that compress it: (1) BAA in 5 business days, (2) we're a SaaS proxy, not an in-network deployment, so InfoSec review is closer to 'reviewing a vendor API' than 'reviewing an Epic integration', (3) for the pilot, you can scope it to a single non-production AI workflow to bypass the higher-rigor review until you've seen value. I've done this exact pattern with [reference TBD].",
    },
    {
      q: "What happens if HFAI goes down? We can't have AI workflows blocked because of your outage.",
      a: "Two layers of protection. One: Fortress Mode is embedded in the SDK — even if our cloud is 100% unreachable, the EU AI Act Article 5 prohibited practices and core HIPAA PHI patterns are still enforced locally. Two: you can configure fail-open or fail-closed per rule. Most healthcare orgs run patient-safety rules fail-closed (block on uncertainty) and convenience rules fail-open. Your call, configurable per rule.",
    },
    {
      q: "What's the sales process from here?",
      a: `Honestly — fastest path is the 30-day Free Pilot. You name one ${company} AI workflow, I get you provisioned this week, BAA signed within 5 business days, and we do a day-30 readout with whoever you want in the room. If it's earned its place, we move to paid. If not, you've spent 30 minutes per week and walked away with a working governance baseline. No deck, no POC document, no statement of work needed for the pilot.`,
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
    { name: "Free", price: "$0", duration: "forever", who: "1 AI system, 5 rules, 7-day event history. No card. Self-serve. Useful for IT to validate the integration before the real pilot." },
    { name: "Starter", price: "$19/mo", duration: "30-day free trial", who: "Up to 3 AI systems, violation detection & alerts, email notifications. Right-sized for a single ambient-scribe pilot." },
    { name: "Pro", price: "$49.99/mo", duration: "30-day free trial", who: "Unlimited systems, advanced analytics, human review workflows, full audit trail. Smaller health systems and digital-health vendors typically land here." },
    { name: "Enterprise", price: "$149.99/mo", duration: "30-day free trial", who: "Everything in Pro + AI-powered root cause analysis, remediation tracking, pattern detection, custom rule templates. Multi-hospital systems typical entry point." },
    { name: "Sovereign", price: "$499/mo", duration: "30-day free trial", who: `Everything in Enterprise + compliance certificates, precedent intelligence, regulator-ready export packs (HIPAA / OCR / CMIA / EU AI Act Annex IV), drift detection, multi-jurisdiction engine, dedicated compliance advisor. Recommended for ${company} given CMIA + AB 3030 + Joint Commission posture.` },
    { name: "CMC Pilot", price: "$0 (proposed)", duration: "30 days", who: `Sovereign-tier features, free for 30 days, applied to one ${company} AI workflow. Full BAA executed. Day-30 readout with CMIO + Compliance + CISO. Right-size to a paid tier afterward based on actual event volume.` },
  ];
  tiers.forEach((t) => {
    h3(`${t.name} — ${t.price}`);
    para(`${t.duration} · ${t.who}`);
  });

  divider();
  h2("Post-call action items");
  bullet(`Send recap email within 2 hours — reference the specific ${company} workflow Scott named`);
  bullet("Send BAA template + architecture overview within 24 hours so privacy officer can start review");
  bullet(`Send Free Pilot signup link with prefilled "${company}" company name`);
  bullet("Add Scott to CRM with next-touch date + 'Healthcare / CMC / Pilot' tag");
  bullet("LinkedIn follow-up: thank him publicly for the call (he reciprocates publicly — established pattern)");
  bullet("Calendar hold for day-30 readout, even if pilot hasn't formally started — anchors the timeline");

  // ============ COLLAB PLAYBOOK — PRESENTER EYES ONLY ============
  doc.addPage();
  // Dark cover band so it visually reads as "private / off-the-record"
  doc.setFillColor(10, 10, 10).rect(0, 0, W, 80, "F");
  doc.setFillColor(196, 153, 58).rect(0, 0, 6, 80, "F");
  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(196, 153, 58);
  doc.text("PRESENTER EYES ONLY · DO NOT SHARE", M, 35);
  doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(255, 255, 255);
  doc.text("If Scott Says Yes — The 90-Day Playbook", M, 62);
  y = 110;

  para(`This page is for you, not Scott. If he agrees to a pilot in any form, here's the structured ladder of what to do, in what order, to maximize the chance ${company} converts to a paid Sovereign-tier customer at day 90 — and becomes the first healthcare reference customer.`, { muted: true, italic: true });
  divider();

  h2("Phase 1 — Pilot setup (week 1)");
  bullet(`Provision ${company} on Sovereign tier, free for 30 days, applied to ONE specific workflow Scott named.`);
  bullet("BAA in his privacy officer's inbox within 5 business days. Use Lovable Cloud SOC 2 Type II + our standard hash-chain architecture diagram.");
  bullet("Schedule a 30-min IT integration call with whoever owns the AI vendor relationship (likely IT director or CIO direct report).");
  bullet("Pre-load HIPAA + CMIA + AB 3030 rule pack — do NOT make him configure rules manually for the pilot. Friction kills pilots.");
  bullet("Set the day-30 readout meeting NOW. Calendar invite goes out before week 1 ends.");
  divider();

  h2("Phase 2 — Pilot operation (weeks 2-4)");
  bullet("Weekly 15-min check-ins with Scott. Bring ONE specific finding each week (e.g., 'we detected 3 ambient scribe events that flagged AB 3030 disclaimer violations').");
  bullet("If you can identify a single instance where HFAI prevented a real exposure — even minor — make THAT the centerpiece of the day-30 readout.");
  bullet("Quietly map every CMC AI vendor in scope. Build the multi-vendor view so day-30 readout shows 'here's what your AI surface area actually looks like'.");
  bullet("If Shadow AI Discovery surfaces clinicians using ChatGPT — that's gold. Do NOT name individuals; report aggregate patterns.");
  divider();

  h2("Phase 3 — Day-30 readout (the conversion moment)");
  bullet("Audience target: Scott + CMIO + Chief Compliance + (ideally) CFO observer. Push for all three minimum.");
  bullet(`Open with the regulator-defensible artifact: "Here's the Annex IV / HIPAA evidence pack for the workflow we governed for 30 days at ${company}."`);
  bullet("Show 1 specific prevention event in detail. Show the hash chain. Let it land.");
  bullet("Show shadow AI findings if any. Frame as 'here's what we surfaced; you decide how to act on it.'");
  bullet("Pricing ask: 'Sovereign tier, $499/month, applied to your top 3 AI workflows. Right-size up or down at month 6 based on event volume.' Anchor to one OCR settlement avoided ($4.3M average).");
  divider();

  h2("Phase 4 — Reference customer activation (months 2-6)");
  bullet(`If ${company} converts: ask Scott to be quoted by name in one case study. Healthcare buyers will only trust other healthcare buyers — his quote is worth more than 100 of our blog posts.`);
  bullet("Joint webinar or HIMSS appearance: 'Building an OCR-Defensible AI Governance Program at a Mid-Sized Health System'. Co-present.");
  bullet(`Use ${company} logo on the website (with explicit written permission) and in the next round of healthcare-focused outbound.`);
  bullet("Introduce Scott to other healthcare CISOs in the network — give him status as a peer connector. He'll reciprocate by recommending HFAI when CISOs in his network ask 'what AI governance tool should I use'.");
  divider();

  h2("Red lines (don't cross)");
  bullet(`Do NOT promise ${company} bespoke features that aren't on the roadmap. One-off custom builds for one customer kill the company.`);
  bullet("Do NOT discount Sovereign tier below $499/mo at conversion — it sets a floor for every other healthcare buyer. Pilot is free; paid is full price.");
  bullet("Do NOT bypass the medical staff committee. If they're not bought in by day 30, the pilot dies at month 6 regardless of what Scott thinks.");
  bullet("Do NOT name-drop other healthcare prospects to Scott. He'll find out (small world) and lose trust.");
  divider();

  h2("Decision tree — what to say in the moment");
  para("If Scott says 'I love it, when do we start?' → Phase 1 immediately. Don't oversell. 'Great, I'll provision this week and have a BAA to your privacy officer by Friday.'");
  para(`If Scott says 'I need to think about it' → 'Totally fair. Self-provision the Free tier this week — no BAA needed, no PHI in scope. Just see the integration shape. We'll talk again in 2 weeks once you've kicked the tires.'`);
  para("If Scott says 'I need to bring this to my CMIO/Compliance first' → 'Perfect. Want me on that call, or would you rather walk it through yourself? I have a 5-slide deck specifically for medical staff committees if useful.'");
  para("If Scott says 'pricing is high for what we'd use it for' → DO NOT negotiate price. Negotiate scope. 'Let's start with one workflow on Pro tier ($49.99/mo) and prove value before scaling. You can upgrade to Sovereign when the second workflow goes live.'");
  divider();

  h2("Followup cadence after the call");
  bullet("T+2h: recap email (already drafted — see Demo Cockpit 'Open recap in mail').");
  bullet("T+24h: LinkedIn connect + thank him publicly in a post that tags him.");
  bullet("T+72h: BAA template + architecture diagram, even if he hasn't explicitly said yes — 'thinking about this more, here's what setup would look like'.");
  bullet("T+7d: check in. If silent, send the latest OCR enforcement action news clip — keep urgency live without selling.");
  bullet("T+30d: regardless of pilot status, share one specific piece of value (intro, article, regulatory update). Stay top of mind for 12 months minimum.");

  doc.save(`HFAI-${company.replace(/\s+/g, "-")}-Demo-Script-${config.prospectName.replace(/\s+/g, "-")}-${config.callDate}.pdf`);
}
