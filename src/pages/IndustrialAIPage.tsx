import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, ArrowLeft, ArrowRight, CheckCircle, Cpu, Eye, AlertTriangle,
  Bot, Camera, Wrench, Car, FileCheck, Activity,
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
    icon: Bot,
    title: "AI-Controlled Robotics",
    risk: "EU AI Act Article 6 — High-Risk",
    body: "Industrial robots making autonomous decisions about motion, force, or human-proximity safety. HFAI logs every AI-driven actuator decision, applies tolerance rules, and routes anomalies to a trained human reviewer before they become incidents.",
    signals: ["Force/torque tolerance breaches", "Speed & position envelope drift", "Human-proximity safety overrides"],
  },
  {
    icon: Wrench,
    title: "Predictive Maintenance Models",
    risk: "ISO 42001 Clause 8 — Operational Controls",
    body: "ML models forecasting equipment failure can drift, develop bias toward certain failure modes, or under-predict on specific asset classes. HFAI monitors prediction quality, flags drift, and produces audit-ready evidence of model oversight.",
    signals: ["Wear pattern drift before failure", "Parameter creep across cycles", "Model under-prediction on asset classes"],
  },
  {
    icon: Camera,
    title: "Computer Vision Quality Control",
    risk: "Product Liability + EU AI Act transparency",
    body: "Vision models that pass or reject products on a production line. HFAI tracks false-negative rates, surfaces edge cases for human review, and creates a defensible record of every AI-driven QC decision.",
    signals: ["Confidence threshold breaches", "False-negative rate spikes", "Borderline classifications for human review"],
  },
  {
    icon: Car,
    title: "Autonomous & Semi-Autonomous Systems",
    risk: "EU AI Act Article 14 — Human Oversight",
    body: "AGVs, drones, and assistive driving systems require demonstrable human oversight. HFAI provides the contextual-friction review layer regulators expect — without slowing the production floor.",
    signals: ["Spec creep outside approved envelope", "Path-planning anomalies", "Sovereign override authority on demand"],
  },
];

const capabilities = [
  { icon: Activity, title: "AI Decision Logging", body: "Every AI inference from your industrial system flows into the HFAI event ledger via REST API or proxy — same architecture that powers our LLM monitoring." },
  { icon: AlertTriangle, title: "Drift & Anomaly Rules", body: "Define tolerance rules for prediction confidence, output ranges, and behavioural drift. Breaches escalate to your assigned reviewer." },
  { icon: Eye, title: "Human-First Oversight", body: "Maintenance leads, safety engineers, or HFAI-appointed experts review flagged decisions with full context — the cryptographic audit trail proves it." },
  { icon: FileCheck, title: "Regulator-Ready Evidence", body: "Annex IV technical files, ISO 42001 Statement of Applicability, and NIST AI RMF mappings — auto-generated from your live data." },
];

const faqs = [
  {
    q: "Does HFAI replace my SCADA, MES, or industrial monitoring stack?",
    a: "No — and we don't try to. HFAI sits alongside your operational systems and governs the AI/ML decisions inside them. Your PLCs, sensors, and SCADA continue to handle the physical layer. HFAI handles the governance, oversight, and audit layer that regulators require for AI-driven decisions.",
  },
  {
    q: "Can HFAI auto-correct a machine?",
    a: "HFAI predicts and dispatches — your machine acts. We detect drift, anomalies, and out-of-tolerance AI behaviour, then trigger the corrective workflows you define (recalibration request, safe-mode webhook, operator alert). The machine's control system always owns the physical action. This is the same model used by PagerDuty for IT incidents and is the legally defensible boundary.",
  },
  {
    q: "How does this differ from industrial IoT platforms like MindSphere or PTC ThingWorx?",
    a: "Those platforms are built for sensor telemetry and operational analytics. HFAI is built for AI governance — proving your AI-driven decisions are overseen, auditable, and compliant with the EU AI Act, ISO 42001, and NIST AI RMF. Most industrial AI deployments now need both: an IoT layer for telemetry and HFAI for the governance layer regulators are starting to demand.",
  },
  {
    q: "What integration is required on the industrial side?",
    a: "The same lightweight integration we use for LLMs: a REST POST per AI decision, or our proxy SDK. No agents on PLCs. No deep OT integration. Your control engineers don't need to learn a new platform — your governance team does.",
  },
  {
    q: "Which regulations does this help us meet for industrial AI?",
    a: "EU AI Act Articles 6, 9, 10, 14, 15, 17 (high-risk system requirements, risk management, data governance, human oversight, accuracy/robustness, quality management). ISO 42001 Annex A controls. NIST AI RMF GOVERN, MAP, MEASURE, MANAGE functions. US OSHA documentation expectations for AI-augmented safety systems.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function IndustrialAIPage() {
  usePageView("/industrial-ai");

  return (
    <div className="min-h-screen bg-background">
      {/* SEO */}
      <title>Industrial AI Governance | HFAI — Human-First AI</title>
      <meta name="description" content="HFAI governs AI in robotics, predictive maintenance, computer vision QC, and autonomous systems. EU AI Act, ISO 42001, and NIST AI RMF compliance for industrial AI." />
      <link rel="canonical" href="https://hfa-i.org/industrial-ai" />

      {/* Header */}
      <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold tracking-tight">HFAI</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back home</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            <Cpu className="h-3 w-3 mr-1" /> Industrial AI Governance
          </Badge>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
            Govern the AI inside your <span className="text-primary">machines</span>.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
            Robotics, predictive maintenance, computer vision QC, autonomous systems —
            every AI-driven decision is now a regulated decision. HFAI is the human-oversight
            and audit layer that turns industrial AI into <em>defensible</em> industrial AI.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/pricing/contact">Talk to us about industrial AI <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/readiness-assessment">Run readiness assessment</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Available on the <strong>Sovereign tier</strong>. Same platform, same audit chain — extended to industrial AI use cases.
          </p>
        </motion.div>
      </section>

      {/* Honest boundary callout */}
      <section className="container mx-auto px-4 pb-16">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h2 className="font-semibold text-lg mb-2">What HFAI does — and doesn't — do</h2>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>We govern AI decisions, not machines.</strong> HFAI predicts drift, detects anomalies,
                  and dispatches corrective signals to <em>your</em> control systems. The machine's safety
                  layer always owns the physical action. This is the same legally defensible boundary used
                  by every serious incident-response platform — and it's exactly what the EU AI Act expects.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Use cases */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Where HFAI fits in industrial AI</h2>
          <p className="mt-3 text-muted-foreground">
            Four real use cases where AI governance is now non-optional.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((u, i) => (
            <motion.div key={u.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <u.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{u.title}</h3>
                      <Badge variant="outline" className="mt-1 mb-3 text-xs">{u.risk}</Badge>
                      <p className="text-sm text-muted-foreground leading-relaxed">{u.body}</p>
                      <ul className="mt-3 space-y-1.5">
                        {u.signals.map((s) => (
                          <li key={s} className="flex items-start gap-2 text-xs text-foreground/80">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="container mx-auto px-4 py-16 border-t border-border">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">What you get</h2>
          <p className="mt-3 text-muted-foreground">
            All powered by the HFAI core — no separate stack to learn or operate.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((c, i) => (
            <motion.div key={c.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <c.icon className="h-6 w-6 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 py-16 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Industrial AI FAQs</h2>
            <p className="mt-3 text-muted-foreground">Direct answers to what plant managers and compliance leads ask.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-8 md:p-12 text-center">
            <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl mx-auto">
              Make your industrial AI defensible — before a regulator or insurer asks.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Same human-first architecture trusted for LLM governance, applied to the AI on your factory floor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/pricing/contact">Book industrial AI consult <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/governance">See the framework</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
