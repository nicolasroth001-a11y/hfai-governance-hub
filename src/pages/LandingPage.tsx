import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, Activity, AlertTriangle, UserCheck, ChevronRight,
  Cpu, Zap, Eye, CheckCircle, Brain, ArrowRight,
} from "lucide-react";
import { usePageView } from "@/hooks/usePageView";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { StatsBar } from "@/components/landing/StatsBar";
import { FAQSection } from "@/components/landing/FAQSection";
import { FullDemoExperience } from "@/components/landing/FullDemoExperience";
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
    description: "Track every AI interaction across all models with structured event logging and instant visibility.",
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
  { icon: Cpu, label: "AI System", desc: "Your AI sends events" },
  { icon: Zap, label: "Evaluate", desc: "Rules checked in <200ms" },
  { icon: AlertTriangle, label: "Detect", desc: "Violations flagged" },
  { icon: Eye, label: "Review", desc: "Humans decide" },
];

const trustPoints = [
  "Enterprise-grade security",
  "SOC 2 aligned practices",
  "No data leaves your environment",
  "Sub-200ms detection",
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/pricing/contact")}>
              Pricing
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/governance")}>
              Framework
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/login/customer")}>
              Sign In
            </Button>
            <Button size="sm" className="text-xs gap-1" onClick={() => navigate("/signup/customer")}>
              Get Started <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 sm:pt-40 pb-16 sm:pb-24">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <Shield className="h-7 w-7 text-primary" />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4"
          >
            AI Governance Platform
          </motion.p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.1]">
            Human‑First
            <br />
            <span className="text-primary">AI Governance</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Monitor every AI decision. Catch risky behavior instantly.
            Keep humans in control — always.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mt-8 justify-center"
          >
            <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => navigate("/signup/customer")}>
              Start Free <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12" asChild>
              <a href="#demo">See It In Action</a>
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

      {/* ── CTA ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center rounded-2xl border border-primary/20 bg-primary/5 p-10 sm:p-14"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Ready to govern your AI responsibly?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Start monitoring your AI systems in minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => navigate("/signup/customer")}>
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => navigate("/pricing/contact")}>
              Talk to Sales
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
              <Link to="/pricing/contact" className="text-primary hover:underline text-xs">Pricing</Link>
              <span className="text-border/30">·</span>
              <Link to="/governance" className="text-primary hover:underline text-xs">Framework</Link>
              <span className="text-border/30">·</span>
              <Link to="/login/admin" className="text-muted-foreground hover:text-primary hover:underline text-xs">Admin</Link>
            </div>
            <p className="text-[11px] text-muted-foreground/40">© {new Date().getFullYear()} HFAI — All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
