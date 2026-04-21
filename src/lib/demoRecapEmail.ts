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

  const subject = `HFAI × AESOP — recap + the sandbox offer we discussed`;

  const body = `Hi ${firstName},

Thanks for the time today — and for flagging the Calendly issue last week. You moved this call up by a week and I genuinely appreciate it.

Quick recap of what we walked through:

  • Sign-up to a working governance layer in under 60 seconds (no IT ticket, no procurement)
  • Live COPPA / under-13 PII violation BLOCKED in 9ms before the model output reached the learner
  • Human review with SHA-256 hash-chained audit trail (the artifact regulators actually accept)
  • Auto-generated Annex IV technical documentation — 47 pages, on demand, mapped to EU AI Act + NIST AI RMF GOVERN/MAP/MEASURE/MANAGE
  • Compliance dashboard scoring live as events flow through

What I'm proposing for AESOP:

  1. AESOP-branded sandbox tier — Sovereign features, free for your students, capped per-account event volume
  2. HFAI listed on your standards-alignment page next to UNESCO, NIST, and ISTE
  3. One co-authored short piece (1500 words) on operationalizing EU AI Act Article 4 in education — we do 80% of the writing, you add the curriculum perspective

I'll send the AESOP × HFAI one-pager Monday. In the meantime, two links:

  • Self-provision the $10 Starter (30-day free trial, cancel anytime) for ${config.prospectCompany}: https://hfa-i.org/signup
  • Live demo (the same one we just walked): https://hfa-i.org

And the question I asked at the end stands — if there's one healthcare client in your advisory network where this would be most urgent, I'd be glad to get them onto the same $10 / 30-day-free-trial Starter tomorrow. Just send their email, or forward them the signup link directly.

Thanks again, ${firstName}. Looking forward to building this together.

${presenter}
HFAI · Human-First AI Governance
nicolasroth@hfa-i.org · hfa-i.org`;

  const mailtoUrl = `mailto:${encodeURIComponent(config.prospectEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { to: config.prospectEmail, subject, body, mailtoUrl };
}
