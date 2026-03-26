import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, Activity, AlertTriangle, UserCheck, ChevronRight,
  Cpu, Zap, Eye, CheckCircle, Brain, ArrowRight, Scale, Clock, Star, BookOpen,
} from "lucide-react";
import { usePageView } from "@/hooks/usePageView";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { StatsBar } from "@/components/landing/StatsBar";
import { FAQSection } from "@/components/landing/FAQSection";
import { FullDemoExperience } from "@/components/landing/FullDemoExperience";
import { ComplianceCalculator } from "@/components/landing/ComplianceCalculator";
import { UseCaseCards } from "@/components/landing/UseCaseCards";
import { LeadCapture } from "@/components/landing/LeadCapture";
import dashboardPreview from "@/assets/dashboard-preview.png";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const values = [
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description: "Two integration paths: Proxy (zero-code for OpenAI) or REST API (any AI provider). Full visibility either way.",
    highlight: "Visibility",
  },
  {
    icon: AlertTriangle,
    title: "Instant Detection",
    description: "Automated rule evaluation flags policy violations the moment they occur — zero delay.",
    highlight: "Detection",
  },
  {
    icon: UserCheck,
    title: "Human Oversight",
    description: "Trained reviewers approve or reject flagged events, keeping humans in control of every decision.",
    highlight: "Control",
  },
  {
    icon: Brain,
    title: "Root Cause Analysis",
    description: "AI-powered diagnosis identifies why violations happen and generates remediation playbooks.",
    highlight: "Diagnosis",
  },
];

const steps = [
  { icon: Cpu, label: "Connect", desc: "Proxy or REST API" },
  { icon: Zap, label: "Evaluate", desc: "Rules checked in <200ms" },
  { icon: AlertTriangle, label: "Detect", desc: "Violations flagged" },
  { icon: Eye, label: "Review", desc: "Humans decide" },
];

const trustPoints = [
  "Enterprise-grade encryption",
  "SOC 2 aligned practices",
  "2-minute setup, zero code changes",
  "EU AI Act + NIST AI RMF ready",
];

const pilotIncludes = [
  { icon: Cpu, text: "Unlimited AI systems for 14 days" },
  { icon: Scale, text: "EU AI Act + NIST AI RMF compliance" },
  { icon: UserCheck, text: "Dedicated onboarding support" },
  { icon: Shield, text: "Governance report at end of trial" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  usePageView("/");

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground tracking-tight">HFAI</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" className="text-xs hidden sm:inline-flex" onClick={() => navigate("/docs/sdk")}>
              Docs
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/blog")}>
              Blog
            </Button>
            <Button variant="ghost" size="sm" className="text-xs hidden sm:inline-flex" onClick={() => navigate("/pricing/contact")}>
              Pricing
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/login/customer")}>
              Sign In
            </Button>
            <Button size="sm" className="text-xs gap-1 bg-primary hover:bg-primary/90 hidden sm:inline-flex" onClick={() => navigate("/signup/customer")}>
              Start Free <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 sm:pt-40 pb-16 sm:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Urgency badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-medium text-primary">EU AI Act general-purpose AI rules active Aug 2026 · High-risk obligations begin Dec 2027</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.1]">
            Keep Humans in Control
            <br />
            <span className="text-primary">of Every AI Decision</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Monitor AI in real time. Catch risky behavior instantly. Route critical decisions to human reviewers.
            EU AI Act and NIST AI RMF compliant out of the box.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mt-8 justify-center items-center"
          >
            <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => navigate("/signup/customer")}>
              Create Free Account <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12 gap-2" onClick={() => setDemoOpen(true)}>
              <Eye className="h-4 w-4" /> Try Live Demo
            </Button>
            <Button size="lg" variant="ghost" className="text-base px-8 h-12 gap-2" onClick={() => navigate("/pilot")}>
              <Clock className="h-4 w-4" /> Request Pilot
            </Button>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-8"
          >
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                <CheckCircle className="h-3 w-3 text-primary/70" />
                <span>{point}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Product Preview ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl"
        >
          <div className="relative rounded-2xl border border-border/40 overflow-hidden shadow-2xl shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <img
              src={dashboardPreview}
              alt="HFAI Dashboard — AI governance monitoring with violation alerts, analytics, and human review queue"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </motion.div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <StatsBar />
        </div>
      </section>

      {/* ── Pilot CTA (early placement) ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8 sm:p-12"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase tracking-[0.15em] text-primary font-semibold">Free 14-Day Pilot</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                See governance working on <span className="text-primary">your</span> AI systems
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No credit card. No commitment. Full platform access with dedicated onboarding support.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pilotIncludes.map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button size="lg" className="gap-2" onClick={() => navigate("/signup/customer")}>
                  Start Free — No Card Required <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/pilot")}>
                  Request White-Glove Pilot
                </Button>
              </div>
            </div>
            <div className="shrink-0 hidden sm:flex flex-col items-center gap-2 text-center p-6 rounded-xl border border-border/30 bg-background/50">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">White-Glove Setup</p>
              <p className="text-[11px] text-muted-foreground max-w-[160px]">We help you integrate and configure — zero effort on your end</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Value Propositions ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Everything you need to govern AI
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            From detection to diagnosis to remediation — one platform.
          </p>
        </motion.div>

        <div className="mx-auto max-w-5xl grid gap-4 sm:grid-cols-2">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Card className="border border-border/40 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/20 transition-all duration-300 h-full group">
                <CardContent className="p-6 flex flex-col gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center transition-colors">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-primary/80 font-semibold">
                    {v.highlight}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
            Real-World Scenarios
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mt-2">
            HFAI in Action
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            See how teams in regulated industries use HFAI to govern AI at the decision boundary.
          </p>
        </motion.div>
        <UseCaseCards />
      </section>

      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl"
        >
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Dual Compliance Built-In</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mt-2">
              EU AI Act + NIST AI RMF Ready
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
              One platform. Two regulatory frameworks. Full coverage for both US and EU AI governance requirements.
            </p>
          </div>

          {/* EU AI Act Cards */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🇪🇺</span>
              <span className="text-xs font-semibold text-foreground">EU AI Act</span>
              <span className="text-[10px] text-muted-foreground">— GPAI rules Aug 2026 · High-risk Dec 2027 (Omnibus VII)</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { article: "Art. 9", label: "Risk Management", desc: "Configurable rule engine with severity classification" },
                { article: "Art. 12", label: "Record Keeping", desc: "Every AI event captured with full input/output metadata" },
                { article: "Art. 13", label: "Transparency", desc: "Complete audit trail with exportable compliance reports" },
                { article: "Art. 14", label: "Human Oversight", desc: "Reviewer workflows with approve/reject/escalate" },
                { article: "Art. 15", label: "Accuracy Monitoring", desc: "Real-time anomaly detection and pattern analysis" },
                { article: "Art. 61", label: "Post-Market Monitoring", desc: "Continuous event monitoring and violation detection" },
              ].map((item) => (
                <Card key={item.article} className="border border-border/30 bg-secondary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono text-primary/70">{item.article}</span>
                      <span className="text-sm font-semibold text-foreground">{item.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* NIST AI RMF Cards */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🇺🇸</span>
              <span className="text-xs font-semibold text-foreground">NIST AI Risk Management Framework</span>
              <span className="text-[10px] text-muted-foreground">— Referenced by FTC, SEC, CFPB</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { fn: "GOVERN", desc: "Role-based access, Human-First doctrine, full audit trails", color: "text-primary" },
                { fn: "MAP", desc: "AI system registry with risk tiers, model cards, and data governance", color: "text-blue-500" },
                { fn: "MEASURE", desc: "Real-time monitoring, rule engine, violation pattern detection", color: "text-emerald-500" },
                { fn: "MANAGE", desc: "Human oversight reviews, RCA, remediation actions, alerts", color: "text-amber-500" },
              ].map((item) => (
                <Card key={item.fn} className="border border-border/30 bg-secondary/10">
                  <CardContent className="p-4">
                    <span className={`text-[10px] font-mono font-bold ${item.color}`}>{item.fn}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center mt-6 flex flex-wrap gap-2 justify-center">
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => navigate("/governance")}>
              EU AI Act Details <ArrowRight className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => navigate("/nist-ai-rmf")}>
              NIST AI RMF Details <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      </section>


      {/* ── Compliance Calculator ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Are You Ready?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            Check your compliance timeline against upcoming regulatory deadlines.
          </p>
        </motion.div>
        <ComplianceCalculator />
      </section>

      {/* ── How It Works ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Four steps from AI output to human accountability.
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">{step.label}</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section id="demo" className="px-6 pb-24 scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
            Live Demo
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mt-2">
            See HFAI in Action
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            Walk through a real governance workflow — from event ingestion to human review.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          <InteractiveDemo />
        </motion.div>
      </section>

      {/* ── Post-Demo Signup CTA ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 sm:p-10"
        >
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Like what you see? Start governing in minutes.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Create a free account — no credit card, no sales call. Connect your first AI system in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => navigate("/signup/customer")}>
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="ghost" className="text-base h-12 gap-2" onClick={() => navigate("/pricing/contact")}>
              View Plans
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            {["No credit card", "Free forever tier", "2-min setup"].map(t => (
              <span key={t} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-primary/70" /> {t}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Lead Capture ── */}
      <section className="px-6 pb-24">
        <LeadCapture />
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Questions & Answers
          </h2>
        </motion.div>
        <FAQSection />
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center rounded-2xl border border-primary/20 bg-primary/5 p-10 sm:p-14"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Your AI is making decisions right now.
            <br />
            <span className="text-primary">Who's watching?</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Start your free 14-day pilot. No credit card. No commitment. Full platform access.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => navigate("/signup/customer")}>
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => navigate("/pricing/contact")}>
              View Pricing
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Blog CTA Section ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl"
        >
          <div className="rounded-2xl border border-border/40 bg-secondary/20 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">AI Governance Insights & Guides</h3>
              <p className="mt-1 text-sm text-muted-foreground">Practical articles on AI compliance, the EU AI Act, NIST AI RMF, and keeping humans in control.</p>
            </div>
            <Button size="lg" variant="outline" className="gap-2 shrink-0" onClick={() => navigate("/blog")}>
              Read the Blog <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-10 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">HFAI</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs text-center sm:text-left">
              Human‑First AI Governance — keeping humans in control of every AI decision.
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <div className="flex items-center gap-4">
              <Link to="/blog" className="text-primary hover:underline text-xs">Resources</Link>
              <span className="text-border/30">·</span>
              <Link to="/pricing/contact" className="text-primary hover:underline text-xs">Pricing</Link>
              <span className="text-border/30">·</span>
              <Link to="/governance" className="text-primary hover:underline text-xs">Framework</Link>
              <span className="text-border/30">·</span>
              <Link to="/pilot" className="text-primary hover:underline text-xs">Free Pilot</Link>
              <span className="text-border/30">·</span>
              <Link to="/login/admin" className="text-muted-foreground hover:text-primary hover:underline text-xs">Admin</Link>
            </div>
            <p className="text-[11px] text-muted-foreground/40">© {new Date().getFullYear()} HFAI — All rights reserved</p>
          </div>
        </div>
      </footer>
      <FullDemoExperience open={demoOpen} onClose={() => setDemoOpen(false)} />

      {/* ── Sticky mobile CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl px-4 py-3 flex items-center gap-2">
        <Button className="flex-1 text-sm h-10 gap-1.5" onClick={() => navigate("/signup/customer")}>
          Start Free <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-10 px-3" onClick={() => navigate("/pilot")}>
          Pilot
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-10 px-3" onClick={() => navigate("/pricing/contact")}>
          Pricing
        </Button>
      </div>
    </div>
  );
}
