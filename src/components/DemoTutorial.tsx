import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Activity, AlertTriangle, UserCheck, Zap, ChevronRight, ChevronLeft, X } from "lucide-react";

const steps = [
  {
    icon: Shield,
    title: "Welcome to HFAI",
    description:
      "This guided demo shows you how Human‑First AI Governance works. You'll explore monitoring, violation detection, and human review — all with sample data.",
  },
  {
    icon: Activity,
    title: "Monitor AI Systems",
    description:
      "Register your AI systems, generate API keys, and stream events in real time. Every interaction is logged for full traceability.",
  },
  {
    icon: AlertTriangle,
    title: "Detect Violations",
    description:
      "Rules automatically evaluate incoming events. When a policy is breached, a violation is created instantly with severity and context.",
  },
  {
    icon: UserCheck,
    title: "Human Review",
    description:
      "Critical violations are routed to trained human reviewers who approve, reject, or escalate — keeping humans in control of AI decisions.",
  },
  {
    icon: Zap,
    title: "You're Ready!",
    description:
      "Explore the dashboard, send test events, and see how violations flow through the system. Everything here uses demo data — feel free to experiment.",
  },
];

interface DemoTutorialProps {
  onComplete: () => void;
}

export function DemoTutorial({ onComplete }: DemoTutorialProps) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md mx-4">
        {/* Skip button */}
        <button
          onClick={onComplete}
          className="absolute -top-12 right-0 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip tutorial <X className="h-3.5 w-3.5" />
        </button>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg space-y-6">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/25"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <current.icon className="h-7 w-7 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              {current.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </Button>

            <span className="text-xs text-muted-foreground">
              {step + 1} / {steps.length}
            </span>

            {isLast ? (
              <Button size="sm" onClick={onComplete} className="gap-1.5">
                Get Started <Zap className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep((s) => s + 1)} className="gap-1.5">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
