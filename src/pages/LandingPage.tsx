import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Activity, AlertTriangle, UserCheck, ChevronRight, Cpu, Zap, Eye } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";

const values = [
  { icon: Activity, title: "Monitor your AI systems", description: "Track every interaction across all your AI models in real time with structured event logging." },
  { icon: AlertTriangle, title: "Detect risky behavior instantly", description: "Automated rule evaluation flags policy violations the moment they occur — no delays." },
  { icon: UserCheck, title: "Human review for every critical decision", description: "Trained reviewers approve or reject flagged events, keeping humans in control." },
];

const steps = [
  { icon: Cpu, label: "AI System" },
  { icon: Zap, label: "Event" },
  { icon: AlertTriangle, label: "Violation" },
  { icon: Eye, label: "Human Review" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  usePageView("/");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground max-w-2xl leading-tight">
          Human‑First AI Governance
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl leading-relaxed">
          HFAI monitors your AI systems, catches risky behavior, and keeps humans in control.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => navigate("/customer/onboarding")}>
            Enter Demo
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8 h-12" asChild>
            <Link to="/pricing/contact">Pricing & Full Release Date</Link>
          </Button>
        </div>
      </section>

      {/* ── Value Points ── */}
      <section className="px-6 pb-20">
        <h2 className="text-2xl font-semibold text-foreground text-center mb-8">Why HFAI?</h2>
        <div className="mx-auto max-w-4xl grid gap-5 sm:grid-cols-3">
          {values.map((v) => (
            <Card key={v.title} className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-card-foreground">{v.title}</h3>
                <p className="text-sm text-card-foreground/70 leading-relaxed">{v.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/pricing/contact">Pricing & Full Release Date →</Link>
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
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
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
          <Button variant="outline" asChild>
            <Link to="/pricing/contact">Pricing & Full Release Date →</Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground space-y-2">
        <p>© HFAI</p>
        <p>Demo Mode — Not for production use</p>
        <Link to="/pricing/contact" className="text-primary hover:underline text-xs">
          Pricing & Full Release Date
        </Link>
      </footer>
    </div>
  );
}
