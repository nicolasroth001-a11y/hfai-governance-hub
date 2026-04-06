import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

export function PricingPreview() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tiers = [
    {
      nameKey: "pricingPreview.freeName",
      priceKey: "pricingPreview.freePrice",
      periodKey: "pricingPreview.freePeriod",
      highlight: true,
      featureKeys: ["pricingPreview.freeF1", "pricingPreview.freeF2", "pricingPreview.freeF3", "pricingPreview.freeF4"],
      ctaKey: "pricingPreview.freeCta",
    },
    {
      nameKey: "pricingPreview.proName",
      priceKey: "pricingPreview.proPrice",
      periodKey: "pricingPreview.proPeriod",
      highlight: false,
      featureKeys: ["pricingPreview.proF1", "pricingPreview.proF2", "pricingPreview.proF3", "pricingPreview.proF4"],
      ctaKey: "pricingPreview.proCta",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-2xl"
    >
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
          {t("pricingPreview.badge")}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-2">
          {t("pricingPreview.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("pricingPreview.desc")}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.nameKey}
            className={`rounded-xl border p-6 space-y-4 ${
              tier.highlight
                ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                : "border-border/30 bg-secondary/10"
            }`}
          >
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t(tier.nameKey)}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-foreground">{t(tier.priceKey)}</span>
                <span className="text-sm text-muted-foreground">{t(tier.periodKey)}</span>
              </div>
            </div>
            <ul className="space-y-2">
              {tier.featureKeys.map((fk) => (
                <li key={fk} className="flex items-center gap-2 text-xs text-foreground/80">
                  <CheckCircle className="h-3 w-3 text-primary shrink-0" />
                  {t(fk)}
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
              {t(tier.ctaKey)}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
