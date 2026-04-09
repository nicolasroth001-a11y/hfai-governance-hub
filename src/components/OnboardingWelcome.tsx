import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plug, Layers, Zap, ArrowRight, CheckCircle, Send, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { trackFunnelEvent } from "@/lib/funnel";

const WIZARD_STEPS = [
  {
    id: "welcome",
    icon: Shield,
    title: "Welcome to HFAI",
    subtitle: "Your AI governance platform is ready.",
    description: "Get set up in 3 simple steps. You'll have real-time AI monitoring running in under 2 minutes.",
    visual: "🛡️",
    cta: "Let's Go",
  },
  {
    id: "connect",
    icon: Plug,
    title: "Step 1: Connect Your AI",
    subtitle: "One line of code. That's it.",
    description: "Swap your OpenAI base URL to the HFAI proxy — or use our REST API for any provider. Your existing code keeps working, HFAI just watches.",
    visual: "🔌",
    cta: "Connect Now",
    route: "/customer/connect",
  },
  {
    id: "test",
    icon: Send,
    title: "Step 2: Send a Test Event",
    subtitle: "See HFAI catch a violation in real-time.",
    description: "Send a test AI event and watch HFAI evaluate it against governance rules instantly. This is the \"aha\" moment.",
    visual: "⚡",
    cta: "Send Test Event",
    route: "/customer/onboarding",
  },
  {
    id: "monitor",
    icon: Eye,
    title: "Step 3: You're Live!",
    subtitle: "Your dashboard is ready.",
    description: "Every AI call is now monitored. Violations are flagged, audit trails are built, and reviewers can take action — all automatically.",
    visual: "🎉",
    cta: "Go to Dashboard",
    route: "/customer/dashboard",
  },
];

export function OnboardingWelcome() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { skipAll } = useOnboardingProgress();
  const current = WIZARD_STEPS[step];
  const progress = ((step + 1) / WIZARD_STEPS.length) * 100;

  const handleNext = async () => {
    trackFunnelEvent("onboarding_step_completed", { step: current.id, stepIndex: step });

    if (step === 0) {
      trackFunnelEvent("onboarding_started", { name: profile?.name });
      setStep(1);
      return;
    }

    if (step === WIZARD_STEPS.length - 1) {
      trackFunnelEvent("onboarding_completed", {});
      await skipAll();
      window.location.replace("/customer/dashboard");
      return;
    }

    if (current.route) {
      navigate(current.route);
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = async () => {
    trackFunnelEvent("onboarding_skipped", { skippedAt: current.id });
    await skipAll();
    window.location.replace("/customer/dashboard");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md space-y-4">
        {/* Progress dots */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {WIZARD_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>
          <button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Skip →
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/15 overflow-hidden">
              <CardContent className="p-0">
                {/* Visual header */}
                <div className="bg-primary/5 py-8 flex items-center justify-center">
                  <span className="text-5xl">{current.visual}</span>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-card-foreground">{current.title}</h2>
                    <p className="text-sm text-primary font-medium mt-0.5">{current.subtitle}</p>
                  </div>

                  <p className="text-sm text-card-foreground/65 leading-relaxed">
                    {current.description}
                  </p>

                  <div className="flex gap-2 pt-1">
                    <Button onClick={handleNext} className="flex-1 gap-2">
                      {current.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    {step > 0 && (
                      <Button variant="outline" size="icon" onClick={() => setStep(step - 1)}>
                        ←
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* What you'll get */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: "🔒", label: "Audit trails" },
                { icon: "⚡", label: "Real-time alerts" },
                { icon: "📋", label: "EU AI Act ready" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border/50 bg-card p-3 space-y-1">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
