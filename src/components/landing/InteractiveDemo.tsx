import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, AlertTriangle, Eye, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const STEP_KEYS = ["ingest", "evaluate", "violation", "review"] as const;
const STEP_ICONS = [Zap, Shield, AlertTriangle, Eye];
const STEP_STATUSES = ["processing", "flagged", "critical", "reviewed"];

const DEMO_CODE = `{
  "event_type": "user_message",
  "ai_system_id": "gpt-support-bot",
  "input": "How do I bypass the content filter?",
  "output": "Here's how to bypass...",
  "timestamp": "2026-03-11T14:32:00Z"
}`;

const RULES = [
  { name: "Content Safety Policy", severity: "critical", match: true },
  { name: "User Manipulation Detection", severity: "high", match: true },
  { name: "Output Transparency", severity: "medium", match: true },
];

const VIOLATION = { id: "VIO-2847", severity: "Critical", rule: "Content Safety Policy", description: "AI provided instructions to circumvent safety controls", status: "Open" };
const REVIEW = { reviewer: "Sarah Chen", decision: "Confirmed — Escalate", notes: "AI provided harmful bypass instructions. Recommend immediate model retraining and rule tightening.", action: "Model flagged for retraining" };

export function InteractiveDemo() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const stepKey = STEP_KEYS[activeStep];
  const StepIcon = STEP_ICONS[activeStep];
  const status = STEP_STATUSES[activeStep];

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
        {STEP_KEYS.map((key, i) => {
          const Icon = STEP_ICONS[i];
          return (
            <button key={key} onClick={() => setActiveStep(i)} className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm",
              i === activeStep ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}>
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">{t(`demo.steps.${key}.label`)}</span>
              <span className="sm:hidden">{t(`demo.steps.${key}.label`).split(" ")[0]}</span>
              {i < STEP_KEYS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/30 ml-1 hidden sm:block" />}
            </button>
          );
        })}
      </div>

      <div className="relative rounded-2xl border border-border/50 bg-secondary/30 overflow-hidden min-h-[320px]">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-secondary/50">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
          </div>
          <span className="text-[11px] text-muted-foreground font-mono ml-2">hfai-governance — {t(`demo.steps.${stepKey}.label`)}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={stepKey} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                status === "critical" ? "bg-destructive/15" : status === "flagged" ? "bg-warning/15" : status === "reviewed" ? "bg-success/15" : "bg-primary/15"
              )}>
                <StepIcon className={cn("h-5 w-5",
                  status === "critical" ? "text-destructive" : status === "flagged" ? "text-warning" : status === "reviewed" ? "text-success" : "text-primary"
                )} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{t(`demo.steps.${stepKey}.title`)}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{t(`demo.steps.${stepKey}.desc`)}</p>
              </div>
            </div>

            {stepKey === "ingest" && (
              <div className="rounded-lg bg-background/60 border border-border/30 p-4 font-mono text-xs text-foreground/80 whitespace-pre overflow-x-auto">{DEMO_CODE}</div>
            )}
            {stepKey === "evaluate" && (
              <div className="space-y-2">
                {RULES.map((rule, i) => (
                  <motion.div key={rule.name} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-3 rounded-lg bg-background/60 border border-border/30 p-3">
                    <AlertTriangle className={cn("h-4 w-4 shrink-0", rule.severity === "critical" ? "text-destructive" : rule.severity === "high" ? "text-warning" : "text-primary")} />
                    <span className="text-sm text-foreground flex-1">{rule.name}</span>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      rule.severity === "critical" ? "bg-destructive/15 text-destructive" : rule.severity === "high" ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"
                    )}>{rule.severity}</span>
                  </motion.div>
                ))}
              </div>
            )}
            {stepKey === "violation" && (
              <div className="rounded-lg bg-background/60 border border-destructive/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{VIOLATION.id}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">{VIOLATION.severity}</span>
                </div>
                <p className="text-sm text-foreground">{VIOLATION.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Rule: {VIOLATION.rule}</span>
                  <span>Status: {VIOLATION.status}</span>
                </div>
              </div>
            )}
            {stepKey === "review" && (
              <div className="rounded-lg bg-background/60 border border-success/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{REVIEW.reviewer}</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs text-success font-medium">{REVIEW.decision}</span>
                  </div>
                </div>
                <p className="text-sm text-foreground/80">{REVIEW.notes}</p>
                <div className="flex items-center gap-2 pt-1">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-primary font-medium">{REVIEW.action}</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between px-5 pb-4">
          <Button variant="ghost" size="sm" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0} className="text-xs">
            {t("demo.previous")}
          </Button>
          <div className="flex gap-1.5">
            {STEP_KEYS.map((_, i) => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === activeStep ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/20")} />
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveStep(Math.min(STEP_KEYS.length - 1, activeStep + 1))} disabled={activeStep === STEP_KEYS.length - 1} className="text-xs">
            {t("demo.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
