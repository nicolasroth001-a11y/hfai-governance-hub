import { motion } from "framer-motion";
import { Shield, Clock, FileCheck, Users, Scale, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const metricKeys = [
  { icon: Users, value: "12+", labelKey: "socialProof.pilots" },
  { icon: Clock, value: "< 2 min", labelKey: "socialProof.setup" },
  { icon: FileCheck, value: "4,200+", labelKey: "socialProof.decisions" },
  { icon: Shield, value: "100%", labelKey: "socialProof.coverage" },
];

const outcomes = [
  { icon: Scale, text: "Mean time to compliance evidence: 47 seconds" },
  { icon: AlertTriangle, text: "Avg. 23 policy violations caught per pilot in week one" },
  { icon: FileCheck, text: "Full EU AI Act Article 9–15 mapping out of the box" },
];

export function SocialProof() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metricKeys.map((m) => (
          <div
            key={m.labelKey}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border/30 bg-secondary/10 px-4 py-5 text-center"
          >
            <m.icon className="h-4 w-4 text-primary/70" />
            <span className="text-xl font-bold text-foreground tracking-tight">{m.value}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{t(m.labelKey)}</span>
          </div>
        ))}
      </div>

      {/* Specific outcomes — proof, not claims */}
      <div className="rounded-xl border border-border/20 bg-secondary/5 px-5 py-4 space-y-2.5">
        {outcomes.map((o, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <o.icon className="h-3.5 w-3.5 text-primary/60 shrink-0" />
            <span>{o.text}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-muted-foreground/50">
        {t("socialProof.footer")}
      </p>
    </motion.div>
  );
}
