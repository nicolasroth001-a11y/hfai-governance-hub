import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

const tiers = [
  {
    name: "Free Pilot",
    price: "€0",
    period: "30 days",
    highlight: true,
    features: ["Up to 3 AI systems", "Full audit trail", "Human review queue", "EU AI Act mapping"],
  },
  {
    name: "Pro",
    price: "€490",
    period: "/month",
    highlight: false,
    features: ["Unlimited AI systems", "Custom rules engine", "Webhook integrations", "Priority support"],
  },
];

export function PricingPreview() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-2xl"
    >
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
          Transparent pricing
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-2">
          Start free. Scale when ready.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No credit card required for the pilot. Cancel anytime.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-xl border p-6 space-y-4 ${
              tier.highlight
                ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                : "border-border/30 bg-secondary/10"
            }`}
          >
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {tier.name}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.period}</span>
              </div>
            </div>
            <ul className="space-y-2">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-foreground/80">
                  <CheckCircle className="h-3 w-3 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full text-xs h-9 gap-1"
              variant={tier.highlight ? "default" : "outline"}
              onClick={() =>
                tier.highlight
                  ? navigate("/signup/customer")
                  : navigate("/pricing/contact")
              }
            >
              {tier.highlight ? "Start Free Pilot" : "Talk to Sales"}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
