import { motion } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";
import type { DemoConfig } from "@/lib/demoConfig";

const TIERS = [
  { name: "Free", price: "$0", duration: "forever", highlight: false, features: ["1 AI system", "5 governance rules", "7-day event history"] },
  { name: "Starter", price: "$19", duration: "/month", highlight: false, features: ["Up to 3 AI systems", "Violation detection & alerts", "Email notifications"] },
  { name: "Pro", price: "$49.99", duration: "/month", highlight: true, features: ["Unlimited AI systems", "Analytics + human review", "Full audit trail"] },
  { name: "Enterprise", price: "$149.99", duration: "/month", highlight: false, features: ["Root cause analysis (AI)", "Pattern detection", "Custom rule templates"] },
  { name: "Sovereign", price: "$499", duration: "/month", highlight: false, features: ["Compliance certificates", "Multi-jurisdiction engine", "Dedicated advisor"] },
];

export function Scene8Close({ config }: { config: DemoConfig }) {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-primary/30 bg-card p-8 text-center shadow-sm">
        <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
        <h2 className="text-2xl font-bold tracking-tight mb-2 text-card-foreground">Two questions, {config.prospectName.split(" ")[0]}</h2>
        <div className="grid gap-4 md:grid-cols-2 mt-6 text-left max-w-2xl mx-auto">
          <div className="rounded-lg border border-primary/20 bg-muted/40 p-5">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Question 1</p>
            <p className="text-sm font-semibold leading-snug text-card-foreground">Of the healthcare clients you advise — is there one where this would be most urgent?</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-muted/40 p-5">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Question 2</p>
            <p className="text-sm font-semibold leading-snug text-card-foreground">Would your AESOP students benefit from a free HFAI tier to run governance against real models?</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-3 md:grid-cols-5">
        {TIERS.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
            className={`rounded-xl border p-5 ${t.highlight ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-card"}`}>
            {t.highlight && <p className="text-[9px] uppercase tracking-widest text-primary font-bold mb-2">Recommended</p>}
            <p className="text-sm font-bold mb-1">{t.name}</p>
            <p className="text-2xl font-bold">{t.price}<span className="text-xs font-normal text-muted-foreground ml-1">{t.duration}</span></p>
            <ul className="mt-3 space-y-1.5">
              {t.features.map((f) => (
                <li key={f} className="text-[11px] text-card-foreground/70 flex items-start gap-1.5">
                  <ArrowRight className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="text-center text-xs text-muted-foreground">
        Thanks for your time, {config.prospectName.split(" ")[0]}. Recap email coming within 2 hours.
      </motion.p>
    </div>
  );
}
