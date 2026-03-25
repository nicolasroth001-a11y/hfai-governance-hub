import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plug, Layers, Zap, BookOpen, ArrowRight, CheckCircle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { trackFunnelEvent } from "@/lib/funnel";

const WIZARD_STEPS = [
  {
    id: "welcome",
    icon: Shield,
    title: "Welcome to HFAI",
    description: "Your AI governance platform is ready. Let's get you set up in under 2 minutes.",
    bullets: [
      "Connect your AI provider (OpenAI, Anthropic, etc.)",
      "Configure governance rules",
      "Monitor events and violations in real-time",
    ],
    cta: "Let's Get Started",
  },
  {
    id: "connect",
    icon: Plug,
    title: "Connect Your AI",
    description: "Choose how to integrate — zero-code proxy or flexible REST API.",
    bullets: [
      "Proxy: Swap your base URL — HFAI monitors automatically",
      "REST API: Works with any AI provider",
      "Takes less than 30 seconds",
    ],
    cta: "Go to Connect Page",
    route: "/customer/connect",
  },
  {
    id: "rules",
    icon: Layers,
    title: "Set Your First Rule",
    description: "Rules define what your AI can and can't do. Start with a template or create your own.",
    bullets: [
      "Choose from 10+ pre-built rule templates",
      "Customize severity levels and categories",
      "Rules evaluate every AI event automatically",
    ],
    cta: "Browse Rule Templates",
    route: "/customer/rule-templates",
  },
  {
    id: "monitor",
    icon: Zap,
    title: "You're All Set!",
    description: "Your dashboard is ready. Send a test event or explore your governance tools.",
    bullets: [
      "Send a test event to see HFAI in action",
      "View real-time violations on your dashboard",
      "Check the SDK docs for advanced integration",
    ],
    cta: "Go to Dashboard",
    route: "/customer/dashboard",
  },
];

export function OnboardingWelcome() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { completeStep } = useOnboardingProgress();
  const current = WIZARD_STEPS[step];
  const progress = ((step + 1) / WIZARD_STEPS.length) * 100;

  const handleNext = () => {
    trackFunnelEvent("onboarding_step_completed", { step: current.id, stepIndex: step });

    if (step === 0) {
      // Mark that user started onboarding
      trackFunnelEvent("onboarding_started", { name: profile?.name });
    }

    if (current.route) {
      // If this is the last step or has a route, navigate away
      if (step === WIZARD_STEPS.length - 1) {
        trackFunnelEvent("onboarding_completed", {});
      }
      navigate(current.route);
    } else if (step < WIZARD_STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    trackFunnelEvent("onboarding_skipped", { skippedAt: current.id });
    navigate("/customer/dashboard");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {WIZARD_STEPS.length}</span>
          <button onClick={handleSkip} className="hover:text-foreground transition-colors">
            Skip setup →
          </button>
        </div>
        <Progress value={progress} className="h-1.5" />

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-primary/20">
              <CardContent className="p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <current.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{current.title}</h2>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {current.description}
                </p>

                <div className="space-y-2.5">
                  {current.bullets.map((b) => (
                    <div key={b} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{b}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleNext} className="flex-1 gap-2">
                    {current.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  {step > 0 && (
                    <Button variant="outline" onClick={() => setStep(step - 1)}>
                      Back
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
