import type { DemoConfig } from "./demoConfig";

export interface RecapEmail {
  to: string;
  subject: string;
  body: string;
  mailtoUrl: string;
}

export function buildRecapEmail(config: DemoConfig): RecapEmail {
  const firstName = config.prospectName.split(" ")[0];
  const presenter = config.presenterName;

  const subject = `HFAI × ${config.prospectCompany} — recap + the pilot offer we discussed`;

  const body = `Hi ${firstName},

Thanks for the time today — and for flagging the Calendly issue last week. You moved this call up by a week and I genuinely appreciate it.

Quick recap of what we walked through, framed for ${config.prospectCompany}:

  • Sign-up to a working governance layer in under 60 seconds (no IT ticket, no procurement gate)
  • Live PHI exposure scenario BLOCKED in 9ms — before the model output reached the patient-facing surface
  • Human review with SHA-256 hash-chained audit trail (the artifact OCR investigators and plaintiff attorneys actually accept)
  • Auto-generated EU AI Act Annex IV documentation — 47 pages, on demand, mapped to HIPAA Security Rule + NIST AI RMF GOVERN/MAP/MEASURE/MANAGE
  • Compliance dashboard scoring live as clinical AI events flow through

Where I see this fitting at ${config.prospectCompany}:

  1. Ambient clinical documentation (Nuance DAX / Abridge / Suki) — every transcript and SOAP-note suggestion logged with a HIPAA-mapped audit trail before it touches the chart
  2. Clinical decision support — every CDS recommendation reviewable, every override captured, every model drift alert fired to your medical staff committee
  3. Patient-facing chatbots and triage — PHI exposure, off-label medical advice, and emergency-handoff failures blocked at the API in milliseconds

What I'd propose as a starting point:

  • A 30-day Free Pilot for one ${config.prospectCompany} AI workflow of your choice — full Sovereign-tier features, no card required
  • One readout call at day 30 with whoever owns AI governance on your end (CISO, CMIO, Chief Compliance, or all three)
  • If it earns its place, we move to a paid engagement; if it doesn't, you've spent 30 minutes per week and walked away with a ready-to-use governance baseline

In the meantime, two links:

  • Self-provision the pilot for ${config.prospectCompany}: https://hfa-i.org/signup
  • Live walkthrough (the same one we just did): https://hfa-i.org

The two questions I asked at the end stand: which clinical AI workflow at ${config.prospectCompany} is closest to a regulator-visible incident today, and who on your team owns the audit-trail conversation when OCR or your malpractice carrier calls?

Thanks again, ${firstName}. Looking forward to making this real.

${presenter}
HFAI · Human-First AI Governance
nicolasroth@hfa-i.org · hfa-i.org`;

  const mailtoUrl = `mailto:${encodeURIComponent(config.prospectEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { to: config.prospectEmail, subject, body, mailtoUrl };
}
