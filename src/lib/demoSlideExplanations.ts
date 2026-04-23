// Plain-English narration shown in BLACK text underneath each scene.
// Designed to be readable on-camera when the demo is screen-recorded
// and emailed to a prospect (e.g. Scott) who watches without a presenter.

export const SLIDE_EXPLANATIONS: Record<number, { headline: string; body: string }> = {
  1: {
    headline: "Step 1 — Sign-Up",
    body: "Anyone on your team can self-serve. Email, password, company name — and a fully isolated organization is provisioned in under a second, with row-level security policies and an audit chain ready to go. No sales gate, no IT ticket.",
  },
  2: {
    headline: "Step 2 — API Key & Both-Sides Setup",
    body: "On the left: the two environment variables your engineers add to their app. On the right: what HFAI provisions automatically — a tenant-isolated database slice, the default HIPAA + EU AI Act rule pack, and a fresh hash-chained audit trail. Setup is symmetrical and transparent.",
  },
  3: {
    headline: "Step 3 — Reviewer Team (EU AI Act Article 14)",
    body: "Article 14 of the EU AI Act requires meaningful human oversight. You can add unlimited in-house reviewers — your compliance team, clinical leads, or faculty. On the Sovereign tier, HFAI also appoints an independent Expert reviewer with override authority — exactly what regulators want to see.",
  },
  4: {
    headline: "Step 4 — Connect Your AI System",
    body: "Integration is one line of code: change your OpenAI / Anthropic / Gemini base URL to point at the HFAI proxy. We sit invisibly in the middle. No prompt rewrites, no refactors, no vendor lock-in. Pull the URL out and you are back to direct provider access.",
  },
  5: {
    headline: "Step 5 — Live Event Stream",
    body: "Every prompt and every model response is captured in real time and added to a tamper-evident audit chain. Raw PHI or PII is never persisted in clear text — only hash-chained metadata. You can watch your AI traffic live as it happens.",
  },
  6: {
    headline: "Step 6 — Violation Detected & Blocked",
    body: "A risky prompt fires. In a normal stack the response goes straight to the user. With HFAI it is BLOCKED in roughly 12 milliseconds, mapped to the relevant EU AI Act article and HIPAA / COPPA control, and written to the audit log — all before the user sees anything. Even if HFAI's cloud were offline, Article 5 and child-safety rules still fire locally via Fortress Mode.",
  },
  7: {
    headline: "Step 7 — What the End User Sees",
    body: "No scary technical error and no exposed PHI. The patient, student, or staff member receives a calm, branded fallback message with a reference number for follow-up. The user feels cared for; your team gets the full audit trail.",
  },
  8: {
    headline: "Step 8 — Human Review & Hash-Chained Audit",
    body: "A reviewer opens the violation, adds notes, and approves or rejects. Each decision writes a SHA-256 hash chained to the previous review. Tamper with one entry and every subsequent hash breaks. This is cryptographic evidence — not a CSV log.",
  },
  9: {
    headline: "Step 9 — Live Compliance Dashboard",
    body: "The compliance score updates in real time as reviews are completed. You can see active rules, events governed in the last 24 hours, violations blocked, and how many of those reached an end user (zero). One dashboard, board-ready.",
  },
  10: {
    headline: "Step 10 — Generated Audit Report (Annex IV)",
    body: "One click generates the EU AI Act Annex IV technical documentation that regulators will demand starting August 2026. Forty-plus pages of regulator-grade evidence — pulled from real audit data, not memory or a Word template.",
  },
  11: {
    headline: "Step 11 — Industrial AI Coverage",
    body: "The same hash-chained oversight extends to physical-world AI: factory robotics, computer-vision quality control, predictive maintenance, and autonomous mobile units. Standards mapped out of the box include ISO 23482, IEC 61508, ISO 13849, and OSHA 1910. A misclassified weld or missed proximity event is an OSHA filing — or worse — and HFAI governs that AI the same way it governs a chatbot.",
  },
  12: {
    headline: "Step 12 — Pricing & The Two-Question Close",
    body: "End-to-end: from sign-up to a blocked violation to regulator-ready evidence in roughly fifteen minutes of real work. Pricing scales from a free 30-day pilot up to Sovereign for high-risk EU AI Act and HIPAA-regulated deployments. Two questions: which clinical AI workflow at your health system is closest to a regulator-visible incident today, and who owns the audit-trail conversation when OCR or your malpractice carrier calls?",
  },
};
