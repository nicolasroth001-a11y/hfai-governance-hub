import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, AlertTriangle, Eye, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEMO_STEPS = [
  {
    id: "ingest",
    label: "AI Event Ingested",
    icon: Zap,
    description: "Your AI system sends an event to HFAI via API",
    detail: {
      title: "user_message event received",
      code: `{
  "event_type": "user_message",
  "ai_system_id": "gpt-support-bot",
  "input": "How do I bypass the content filter?",
  "output": "Here's how to bypass...",
  "timestamp": "2026-03-11T14:32:00Z"
}`,
    },
    status: "processing",
  },
  {
    id: "evaluate",
    label: "Rules Evaluated",
    icon: Shield,
    description: "HFAI evaluates 12 governance rules against the event",
    detail: {
      title: "3 rules triggered",
      rules: [
        { name: "Content Safety Policy", severity: "critical", match: true },
        { name: "User Manipulation Detection", severity: "high", match: true },
        { name: "Output Transparency", severity: "medium", match: true },
      ],
    },
    status: "flagged",
  },
  {
    id: "violation",
    label: "Violation Created",
    icon: AlertTriangle,
    description: "A critical violation is automatically generated",
    detail: {
      title: "VIO-2847 created",
      violation: {
        id: "VIO-2847",
        severity: "Critical",
        rule: "Content Safety Policy",
        description: "AI provided instructions to circumvent safety controls",
        status: "Open",
      },
    },
    status: "critical",
  },
  {
    id: "review",
    label: "Human Review",
    icon: Eye,
    description: "A trained reviewer examines the violation and decides",
    detail: {
      title: "Reviewer decision",
      review: {
        reviewer: "Sarah Chen",
        decision: "Confirmed — Escalate",
        notes: "AI provided harmful bypass instructions. Recommend immediate model retraining and rule tightening.",
        action: "Model flagged for retraining",
      },
    },
    status: "reviewed",
  },
];

export function InteractiveDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const step = DEMO_STEPS[activeStep];

  return (
    <div className="w-full">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
        {DEMO_STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveStep(i)}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm",
              i === activeStep
                ? "bg-primary/15 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sm:hidden">{s.label.split(" ")[0]}</span>
            {i < DEMO_STEPS.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/30 ml-1 hidden sm:block" />
            )}
          </button>
        ))}
      </div>

      {/* Demo content */}
      <div className="relative rounded-2xl border border-border/50 bg-secondary/30 overflow-hidden min-h-[320px]">
        {/* Terminal-style header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-secondary/50">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
          </div>
          <span className="text-[11px] text-muted-foreground font-mono ml-2">
            hfai-governance — {step.label}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="p-5 sm:p-6"
          >
            {/* Step description */}
            <div className="flex items-center gap-3 mb-5">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                step.status === "critical" ? "bg-destructive/15" :
                step.status === "flagged" ? "bg-warning/15" :
                step.status === "reviewed" ? "bg-success/15" :
                "bg-primary/15"
              )}>
                <step.icon className={cn(
                  "h-5 w-5",
                  step.status === "critical" ? "text-destructive" :
                  step.status === "flagged" ? "text-warning" :
                  step.status === "reviewed" ? "text-success" :
                  "text-primary"
                )} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{step.detail.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              </div>
            </div>

            {/* Step-specific content */}
            {step.id === "ingest" && (
              <div className="rounded-lg bg-background/60 border border-border/30 p-4 font-mono text-xs text-foreground/80 whitespace-pre overflow-x-auto">
                {step.detail.code}
              </div>
            )}

            {step.id === "evaluate" && (
              <div className="space-y-2">
                {step.detail.rules?.map((rule, i) => (
                  <motion.div
                    key={rule.name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-3 rounded-lg bg-background/60 border border-border/30 p-3"
                  >
                    <AlertTriangle className={cn(
                      "h-4 w-4 shrink-0",
                      rule.severity === "critical" ? "text-destructive" :
                      rule.severity === "high" ? "text-warning" :
                      "text-primary"
                    )} />
                    <span className="text-sm text-foreground flex-1">{rule.name}</span>
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      rule.severity === "critical" ? "bg-destructive/15 text-destructive" :
                      rule.severity === "high" ? "bg-warning/15 text-warning" :
                      "bg-primary/15 text-primary"
                    )}>
                      {rule.severity}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {step.id === "violation" && step.detail.violation && (
              <div className="rounded-lg bg-background/60 border border-destructive/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{step.detail.violation.id}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">
                    {step.detail.violation.severity}
                  </span>
                </div>
                <p className="text-sm text-foreground">{step.detail.violation.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Rule: {step.detail.violation.rule}</span>
                  <span>Status: {step.detail.violation.status}</span>
                </div>
              </div>
            )}

            {step.id === "review" && step.detail.review && (
              <div className="rounded-lg bg-background/60 border border-success/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{step.detail.review.reviewer}</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs text-success font-medium">{step.detail.review.decision}</span>
                  </div>
                </div>
                <p className="text-sm text-foreground/80">{step.detail.review.notes}</p>
                <div className="flex items-center gap-2 pt-1">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-primary font-medium">{step.detail.review.action}</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between px-5 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="text-xs"
          >
            ← Previous
          </Button>
          <div className="flex gap-1.5">
            {DEMO_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeStep ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/20"
                )}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveStep(Math.min(DEMO_STEPS.length - 1, activeStep + 1))}
            disabled={activeStep === DEMO_STEPS.length - 1}
            className="text-xs"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
