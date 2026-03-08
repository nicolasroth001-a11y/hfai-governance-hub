import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Activity, AlertTriangle, UserCheck, ChevronRight, Cpu, Zap, Eye, CheckCircle, Building2, Lock } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";
import dashboardPreview from "@/assets/dashboard-preview.png";

const values = [
  {
    icon: Activity,
    title: "Monitor your AI systems",
    description: "Track every interaction across all your AI models in real time with structured event logging.",
    highlight: "Real-time visibility",
  },
  {
    icon: AlertTriangle,
    title: "Detect risky behavior instantly",
    description: "Automated rule evaluation flags policy violations the moment they occur — no delays.",
    highlight: "Instant detection",
  },
  {
    icon: UserCheck,
    title: "Human review for every critical decision",
    description: "Trained reviewers approve or reject flagged events, keeping humans in control.",
    highlight: "Human oversight",
  },
];

const steps = [
  { icon: Cpu, label: "AI System" },
  { icon: Zap, label: "Event" },
  { icon: AlertTriangle, label: "Violation" },
  { icon: Eye, label: "Human Review" },
];

const trustPoints = [
  "Enterprise-grade security",
  "SOC 2 aligned practices",
  "No data leaves your environment",
];

export default function LandingPage() {
  const navigate = useNavigate();
  usePageView("/");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-12">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-3xl leading-tight">
          Human‑First AI Governance
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl leading-relaxed">
          HFAI monitors your AI systems, catches risky behavior, and keeps humans in control.
        </p>

        {/* Social proof line */}
        <p className="mt-6 text-sm text-muted-foreground/70 tracking-wide uppercase font-medium">
          Built for teams managing AI at scale
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => navigate("/signup/customer")}>
            Get Started
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => navigate("/login/customer")}>
            Sign In
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8">
          {trustPoints.map((point) => (
            <div key={point} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product Preview ── */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="relative rounded-2xl border border-border/50 overflow-hidden shadow-2xl shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10 pointer-events-none" />
            <img
              src={dashboardPreview}
              alt="HFAI Dashboard — AI governance monitoring with violation alerts, analytics, and human review queue"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground/50 mt-4">
            Real-time AI governance monitoring dashboard
          </p>
        </div>
      </section>

      {/* ── Value Points ── */}
      <section className="px-6 pb-20">
        <h2 className="text-2xl font-semibold text-foreground text-center mb-3">Why HFAI?</h2>
        <p className="text-sm text-muted-foreground text-center mb-10 max-w-lg mx-auto">
          Everything you need to govern AI responsibly — in one platform.
        </p>
        <div className="mx-auto max-w-4xl grid gap-5 sm:grid-cols-3">
          {values.map((v, i) => (
            <Card
              key={v.title}
              className="border border-border bg-card shadow-sm hover:shadow-lg hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 group"
            >
              <CardContent className="p-6 flex flex-col gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors duration-300">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">
                  {v.highlight}
                </span>
                <h3 className="text-base font-semibold text-card-foreground">{v.title}</h3>
                <p className="text-sm text-card-foreground/70 leading-relaxed">{v.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/pricing/contact">Pricing & Contact →</Link>
          </Button>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl text-center mb-10">
          <h2 className="text-2xl font-semibold text-foreground">How It Works</h2>
          <p className="mt-2 text-sm text-muted-foreground">Four steps from AI output to human accountability.</p>
        </div>
        <div className="mx-auto max-w-2xl flex items-center justify-center gap-2 sm:gap-4">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center gap-2 group">
                <div className="h-12 w-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors duration-300">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-[-1rem]" />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => navigate("/signup/customer")}>
            Start Free
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
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
              <Link to="/pricing/contact" className="text-primary hover:underline text-xs">
                Pricing
              </Link>
              <span className="text-border">·</span>
              <Link to="/governance" className="text-primary hover:underline text-xs">
                Governance Framework
              </Link>
              <span className="text-border">·</span>
              <Link to="/login/admin" className="text-muted-foreground hover:text-primary hover:underline text-xs">
                Admin
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground/50">© {new Date().getFullYear()} HFAI — All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
