import { motion } from "framer-motion";
import { Shield, Lock, FileCheck, Award, Globe, Cpu } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CredibilitySignals() {
  const { t } = useTranslation();

  const signals = [
    { icon: Shield, key: "euAiAct" as const },
    { icon: FileCheck, key: "nistRmf" as const },
    { icon: Lock, key: "encryption" as const },
    { icon: Award, key: "soc2" as const },
    { icon: Globe, key: "gdpr" as const },
    { icon: Cpu, key: "runtime" as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-4xl"
    >
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
          {t("credibility.badge")}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-2">
          {t("credibility.title")}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {signals.map((signal, i) => (
          <motion.div
            key={signal.key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 rounded-xl border border-border/30 bg-secondary/10 p-4 hover:border-primary/20 transition-colors"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <signal.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight">
                {t(`credibility.signals.${signal.key}.title`)}
              </p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                {t(`credibility.signals.${signal.key}.desc`)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
