# Audit done. Here's the real picture.

I went through your code. Good news: you've built **way more than you needed for the loop**. Bad news: the pieces aren't pointed at the wedge — they're pointed at enterprise sales. That's a 1-week fix, not a 6-month rebuild.

## What you already have (the 70%)

| Piece | Status | Where |
|---|---|---|
| Free 3-question exposure quiz | ✅ Built | `ExposureCheck.tsx` on landing page |
| Free 8-question deeper assessment | ✅ Built | `/readiness-assessment` page |
| AI-generated personalized risk report (Gemini) | ✅ Built | `generate-risk-report` edge function |
| Email capture from assessment | ✅ Built | Both quizzes capture email |
| Runtime firewall SDK (`@hfai/guard`) | ✅ Built | `public/sdk/hfai-guard.js` |
| Ingest endpoint with API-key auth | ✅ Built | `ingest-event` edge function |
| Stripe tiers ($10 / $50 / $150 / $499) | ✅ Live | `stripe-config.ts` |
| Customer dashboard with violations, audit trail, reports | ✅ Built | 40+ customer pages |
| Cold email + lead generator | ✅ Built | `generate-leads`, `send-cold-email` |
| Email queue, transactional emails, suppression | ✅ Built | Full Lovable email infra |

## What's broken about the loop (the 30%)

Three specific holes — each one breaks the "oh you got this then you'll want this" magic:

### Hole 1: The free quiz doesn't actually scare them
The current `ExposureCheck` ends with "Send my report" → Gemini writes a generic report → email. The user **never sees a number, an article, or a fine amount in the browser**. Nothing to share. Nothing to scream about. Compare to: Stripe Atlas, "Is your name available," etc. — they show the scary result *immediately on screen*, then ask for email to "save" it.

### Hole 2: The report doesn't lead anywhere
After the assessment, the CTA says "Start Free 30-Day Pilot" → goes to `/pilot` (a generic signup form). It does NOT say "We found 3 critical gaps. Fix them now in 2 minutes for $10/mo" with a one-click upgrade to Starter. The bridge from "scared" to "swiping card" is missing.

### Hole 3: The Starter tier doesn't have an "obvious next rung"
Once someone is on Starter ($10), the product doesn't surface "you've now logged 50 violations — to PROVE these to your auditor you need Pro ($50)." The upgrades happen at billing time, not at *moment-of-need* time. That kills the upsell loop.

## The plan: close the loop in 3 small builds

Build smallest → biggest impact, in this order. Each one is one focused coding session.

### Build 1 — Make the free scan scary on screen (the wedge that gets shared)
**Goal**: turn the readiness assessment into a result page that founders screenshot and send to their CTO at 11pm.

What changes:
- After the 8 questions, show a **big number**: "Your EU AI Act exposure: €18,200,000" (calculated from their answers + a public fines table — no AI call needed, instant)
- Show a **Compliance Score badge** (you already have ComplianceScore.tsx — reuse it) at like 23/100
- Show **3 specific scary gaps** with article numbers ("Article 14: No human oversight = automatic non-compliance for high-risk AI")
- Add a "Share these results" button that copies a pre-filled tweet/LinkedIn post
- Email capture becomes "Lock in this assessment + get the PDF" (lower friction — they've already seen the number)

This is ~2-3 hours of work. Pure UI on top of an existing page.

### Build 2 — One-click bridge from scan → paid
**Goal**: when the scan ends, the next click is Stripe checkout, not a generic signup.

What changes:
- New CTA on the assessment results page: **"Fix this in 2 minutes — $10/mo"** that goes directly to Stripe Checkout for the Starter tier (you already have `create-checkout`)
- After successful checkout, route them straight into a stripped-down onboarding that says: "Paste your AI endpoint here. We'll start blocking violations in 60 seconds."
- The onboarding writes their assessment answers into the `ai_systems` row so their dashboard opens with their gaps already mapped, not empty
- Email a "Your scan + your fix is live" transactional email with a link back to the dashboard

This is ~4-6 hours. Mostly stitching existing pieces (Stripe checkout, customer onboarding, ingest API key generation) into a single linear flow.

### Build 3 — In-product "next rung" prompts (the upsell engine)
**Goal**: the product itself surfaces the next paid tier at the moment of pain.

What changes:
- When a Starter user hits 50 logged violations → in-app banner: "You've blocked 50 things. Want a regulator-ready audit report? Upgrade to Pro." → 1-click upgrade
- When a Pro user runs their 3rd compliance report → banner: "You're proving compliance manually. Enterprise auto-generates these monthly + adds RCA on every violation." → 1-click upgrade
- When an Enterprise user has any high-risk system flagged → banner: "Article 14 requires a human reviewer in the loop. Sovereign includes HFAI backup reviewers."
- Each banner uses the existing `SubscriptionGate` upgrade modal — no new infrastructure

This is ~3-4 hours. Three banners, three thresholds, reuse existing checkout.

## What I'm explicitly NOT building

- ❌ A new "free badge" embed (you don't need it — the scan IS the wedge)
- ❌ A public compliance status page (nice-to-have for later, not needed for revenue)
- ❌ Any new sales/demo flow (your time is too limited; product-led only)
- ❌ More marketing pages (you have plenty; we need the ones you have to convert better)

## Realistic timeline at 2 hours/night

- **Build 1**: 2 evenings (Tue + Wed of one week)
- **Build 2**: 3 evenings (Thu + Sat morning + Sun)
- **Build 3**: 2 evenings (next week)

**Total: ~10 days of evenings.** Then the loop is closed and you stop building features and start watching numbers.

## What happens after the loop is live

You don't do marketing. You do ONE thing: write 1 SEO blog post per week targeting "EU AI Act fines," "AI compliance checker," "Article 5 prohibited AI practices." Each post links to `/readiness-assessment`. SEO compounds. Scared founders find you. They hit the scary scan. They self-upgrade. You get a Stripe email at 3am. That's the company.

## My recommendation

**Approve this plan and I'll build #1 first** — the scary scan results page. It's the smallest, highest-leverage change, and you'll see if the wedge actually works (do people share it? do they upgrade?) before we invest in #2 and #3.

If #1 doesn't get shares/upgrades, we know the wedge framing is wrong and we adjust before wasting time on #2. If it works, #2 and #3 print money on top of it.

**Approve and I'll start with Build 1 in the next message.**
