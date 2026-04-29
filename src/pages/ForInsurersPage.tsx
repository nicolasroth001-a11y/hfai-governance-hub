import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, ArrowLeft, ArrowRight, CheckCircle, FileCheck, Eye,
  AlertTriangle, ScrollText, Scale, Activity, Clock, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { usePageView } from "@/hooks/usePageView";

const useCases = [
  {
    icon: ScrollText,
    title: "AI-Assisted Claims Triage",
    risk: "EU AI Act Annex III §5 — High-Risk",
    body: "Models that route, prioritise, or recommend denial on bodily-injury, motor, or health claims. HFAI captures every AI recommendation, the human reviewer who saw it, the override (if any), and seals the chain with a SHA-256 hash. That's the Article 14 evidence pack your auditor will ask for.",
    signals: ["Denial recommendations without human sign-off", "Reviewer override patterns by claim type", "Drift in model confidence vs final outcome"],
  },
  {
    icon: Search,
    title: "ML Fraud & SIU Scoring",
    risk: "Annex III §5 + EIOPA AI Statement (2024)",
    body: "Fraud-scoring models that flag claims for SIU referral or denial. EIOPA singled out exactly this scenario for human oversight and bias monitoring. HFAI proves the human reviewed, the bias was tested, and the decision is defensible against bad-faith allegations.",
    signals: ["False-positive rates by demographic", "Threshold drift quarter-over-quarter", "Reviewer concurrence rate"],
  },
  {
    icon: Activity,
    title: "Accelerated / AI Underwriting",
    risk: "Annex III §5 + Solvency II Pillar II",
    body: "Life and health accelerated UW platforms making issue/decline calls in seconds. Solvency II already requires model governance — the AI Act adds Article 11 technical documentation. HFAI generates both from the same evidence stream.",
    signals: ["Decline rate by protected attribute", "Model version vs underwriter override", "Data lineage gaps for inputs"],
  },
  {
    icon: Scale,
    title: "GLM/GBM Pricing Models",
    risk: "Annex III §5 — Pricing & Risk Assessment",
    body: "Motor, home, and SME pricing models. Your actuarial team validates them — but the AI Act asks for a different artifact: a signed Article 11 dossier with data lineage, bias testing, and Article 14 oversight evidence on rate exceptions.",
    signals: ["Rate exception approvals & overrides", "Postcode/protected-class proxy detection", "Model retraining cadence vs drift"],
  },
];

const capabilities = [
  { icon: FileCheck, title: "Signed Article 11 Dossier", body: "One signed PDF + JSON SBOM per model: scope, training data lineage, performance, residual risk, oversight design. The artifact internal audit and a future EIOPA review will ask for." },
  { icon: Eye, title: "Tamper-Evident Article 14 Log", body: "Every AI recommendation + every human decision, hash-chained with SHA-256. Defends the carrier against bad-faith claims and proves human oversight to the regulator." },
  { icon: AlertTriangle, title: "Pre-Deployment Readiness Gate", body: "Article 26 deployer obligation. New pricing or claims model can't go live until the 6-point readiness check passes. Slots into your existing SII model-validation workflow." },
  { icon: Search, title: "Shadow AI Discovery", body: "Finds the underwriter's Excel-with-GPT habit and the claims handler's unsanctioned Copilot use — before the regulator or a journalist does." },
];

const proofPoints = [
  "Built specifically for EU mid-market insurers (€500M–€5B GWP)",
  "Maps directly to Solvency II Pillar II model governance vocabulary your CRO already uses",
  "12-week pilot scope: one in-scope model, end-to-end, signed Article 11 dossier as the deliverable",
  "Sovereign reviewer backstop — HFAI experts can act as your independent human oversight if your team lacks AI literacy",
  "EU-hosted, GDPR-clean, your data never leaves the bloc",
];

const faqs = [
  {
    q: "We already do model validation under Solvency II. Why do we need HFAI?",
    a: "Solvency II model validation answers 'is the model statistically sound?' The EU AI Act asks a different question: 'can you prove a human oversaw it, that you tested for bias, and that the technical documentation is signed?' These are adjacent artifacts, not duplicates. HFAI generates the AI-Act-specific evidence on top of your existing SII workflow — same inputs, different output.",
  },
  {
    q: "Annex III §5 only applies to life and health pricing — does my motor book really need this?",
    a: "Annex III §5 explicitly covers life AND health insurance pricing/risk assessment. Motor and home pricing aren't named — but EIOPA's 2024 supervisory statement makes clear it expects equivalent governance across all AI-driven pricing and claims decisions, and national regulators (BaFin, ACPR, DNB) have signalled they'll apply Article 14 oversight expectations broadly. Most carriers prepare for the strictest interpretation.",
  },
  {
    q: "What does a 12-week pilot actually deliver?",
    a: "One in-scope model (we recommend starting with claims triage or fraud scoring — fastest evidence cycle), instrumented end-to-end. You walk away with: a signed Article 11 technical dossier, a hash-chained Article 14 oversight log of every decision in the pilot window, a deployment-readiness checklist baseline, and a written go/no-go on the rest of your AI portfolio. Fixed scope, fixed price.",
  },
  {
    q: "Who at our company is the right buyer?",
    a: "Chief Risk Officer, Head of Model Risk Management, or Chief Actuary — whoever owns the model governance committee. Compliance and DPO are influencers; the CRO writes the cheque because this lives in their model-risk budget, not IT.",
  },
  {
    q: "What about reinsurance treaties and our broker-facing AI?",
    a: "Out of scope for the wedge pilot. We focus on direct-to-consumer decisions (claims, UW, fraud, pricing) where Annex III §5 bites hardest. Once those are governed, the same platform extends to broker-facing and reinsurance models — but that's phase two.",
  },
];

const checklist = [
  "All claims-triage AI models inventoried with owner, version, and Annex III classification",
  "Article 11 technical documentation drafted for each high-risk model (data, performance, residual risk)",
  "Article 14 human-oversight design documented per model — and actually instrumented",
  "Tamper-evident log of every AI recommendation + human decision, retained ≥10 years",
  "Bias testing performed on protected attributes (age, sex, postcode-as-proxy) within last 12 months",
  "Data-lineage map from source system → training set → model → decision",
  "Pre-deployment readiness checklist passed before any new model or version goes live",
  "Shadow AI discovery run across underwriting, claims, and ops in the last quarter",
  "Reviewer competency documented (AI literacy under Article 4)",
  "Solvency II model validation report cross-mapped to AI Act Articles 9–15",
  "Incident reporting workflow ready for Article 73 serious-incident notification",
  "Board-level AI risk reporting added to the ORSA process",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function ForInsurersPage() {
  usePageView("/for-insurers");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-primary" />
            HFAI
          </Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to platform
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
              For EU Insurers · Annex III §5 · Articles 11 / 14 / 26
            </Badge>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              The signed audit trail your <span className="text-primary">claims AI</span> needs before the regulator asks.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              HFAI is the only AI-governance platform built for EU mid-market insurers. We turn your claims-triage, fraud-scoring, underwriting, and pricing models into a signed Article 11 dossier and a tamper-evident Article 14 oversight log — slotted into the Solvency II model-risk workflow your CRO already runs.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link to="/readiness-assessment">
                  Run the 5-minute insurer readiness check <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing/contact?wedge=insurers">Book a 15-min CRO call</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free 12-point insurer checklist below — no email required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The clock */}
      <section className="border-b border-border/40 bg-secondary/10">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Clock, label: "EU AI Act Article 11", body: "Technical documentation obligations for high-risk insurance AI bite in 2026." },
              { icon: Eye, label: "EIOPA AI Statement (2024)", body: "Supervisors expect human oversight and bias monitoring on claims and pricing models — now." },
              { icon: Scale, label: "Solvency II Pillar II", body: "Your existing model-risk muscle is the foundation. AI Act adds new artifacts on top." },
            ].map((item, i) => (
              <motion.div key={item.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="h-full border-border/40 bg-background/60">
                  <CardContent className="p-5">
                    <item.icon className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-primary font-semibold">{item.label}</p>
                    <p className="mt-2 text-sm text-foreground/85 leading-relaxed">{item.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">Four insurer AI use cases. One governance platform.</h2>
            <p className="mt-3 text-sm text-muted-foreground">If your AI touches a consumer decision, Annex III §5 applies. Here's where we focus.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {useCases.map((uc, i) => (
              <motion.div key={uc.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="h-full border-border/40 bg-secondary/10 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <uc.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">{uc.title}</h3>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-primary/80 font-mono mt-0.5">{uc.risk}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-foreground/85 leading-relaxed">{uc.body}</p>
                    <div className="mt-4 space-y-1.5 border-t border-border/30 pt-3">
                      {uc.signals.map((s) => (
                        <div key={s} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                          <span className="text-xs text-muted-foreground leading-snug">{s}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-b border-border/40 bg-secondary/5">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">What you actually get.</h2>
            <p className="mt-3 text-sm text-muted-foreground">Four artifacts your CRO, internal audit, and the regulator will all recognize.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map((c, i) => (
              <motion.div key={c.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="h-full border-border/40">
                  <CardContent className="p-5">
                    <c.icon className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 text-base font-semibold">{c.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof / why us */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Why insurers pick HFAI over a generalist GRC tool.</h2>
              <p className="mt-3 text-sm text-muted-foreground">Generalist platforms make you map AI Act articles to their schema. We start with your Solvency II vocabulary and add the AI-specific evidence on top.</p>
            </div>
            <div className="space-y-3">
              {proofPoints.map((p, i) => (
                <motion.div key={p} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/90 leading-relaxed">{p}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead magnet checklist */}
      <section id="checklist" className="border-b border-border/40 bg-primary/5">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="mb-8">
            <Badge variant="outline" className="mb-3 border-primary/40 text-primary">Free · No email required</Badge>
            <h2 className="text-2xl font-semibold sm:text-3xl">The 12-point insurer AI Act readiness checklist.</h2>
            <p className="mt-3 text-sm text-muted-foreground">If you can't tick all twelve, you have a 2026 problem. Most carriers we talk to score 4–6.</p>
          </div>
          <Card className="border-border/40 bg-background/80">
            <CardContent className="p-6">
              <ol className="space-y-3">
                {checklist.map((item, i) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-mono flex items-center justify-center shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <span className="text-sm text-foreground/90 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="gap-2">
                  <Link to="/readiness-assessment">
                    Score your readiness in 5 minutes <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/pricing/contact?wedge=insurers">Talk to the founder</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-2xl font-semibold sm:text-3xl mb-8">Questions a CRO actually asks.</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/40">
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-secondary/10">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">12-week pilot. One model. Signed dossier as the deliverable.</h2>
          <p className="mt-4 text-sm text-muted-foreground">Fixed scope. Fixed price. If we don't ship the Article 11 + 14 evidence pack at week 12, you don't pay the final invoice.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link to="/pricing/contact?wedge=insurers">
                Book the CRO call <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/readiness-assessment">Run the readiness check first</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Nicolas Roth, Founder · nicolasroth@hfa-i.org · hfa-i.org/for-insurers</p>
        </div>
      </section>
    </div>
  );
}
