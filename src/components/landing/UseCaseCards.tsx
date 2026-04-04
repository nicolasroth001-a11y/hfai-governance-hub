import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Heart, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const UC_KEYS = ["fintech", "healthtech", "legaltech"] as const;
const UC_ICONS = [Building2, Heart, Scale];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export function UseCaseCards() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-4 sm:grid-cols-3">
        {UC_KEYS.map((key, i) => {
          const Icon = UC_ICONS[i];
          const results = t(`useCases.${key}.results`, { returnObjects: true }) as string[];
          return (
            <motion.div key={key} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Card className="border border-border/40 bg-secondary/10 hover:border-primary/20 transition-all duration-300 h-full group">
                <CardContent className="p-5 flex flex-col gap-3 h-full">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold">{t(`useCases.${key}.industry`)}</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground leading-tight">{t(`useCases.${key}.title`)}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(`useCases.${key}.scenario`)}</p>
                  <div className="mt-auto pt-3 space-y-1.5">
                    {results.map((result) => (
                      <div key={result} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                        <span className="text-[11px] text-foreground/80 leading-snug">{result}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-border/20 mt-2">
                    <p className="text-[10px] text-muted-foreground font-mono">{t(`useCases.${key}.systems`)}</p>
                    <p className="text-[10px] text-primary/70 font-mono mt-0.5">{t(`useCases.${key}.framework`)}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      <div className="text-center mt-6">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate("/signup/customer")}>
          {t("useCases.cta")} <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
