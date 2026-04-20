import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, FileDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DemoConfig } from "@/lib/demoConfig";

export function Scene7Dashboard({ config }: { config: DemoConfig }) {
  const [score, setScore] = useState(78);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setScore(84), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wide">Compliance Score</p>
          </div>
          <div className="relative h-32 flex items-center justify-center">
            <svg className="w-32 h-32 -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
              <motion.circle cx="64" cy="64" r="56" stroke="hsl(var(--primary))" strokeWidth="10" fill="none"
                strokeDasharray={2 * Math.PI * 56} initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - score / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }} strokeLinecap="round" />
            </svg>
            <motion.span key={score} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="absolute text-3xl font-bold">{score}%</motion.span>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-2">EU AI Act + HIPAA + ISO 42001</p>
        </div>

        <div className="md:col-span-2 grid gap-3">
          {[
            { label: "Active rules", value: "47", sub: "12 healthcare-specific" },
            { label: "Events monitored (24h)", value: "12,847", sub: "98.7% pass-through" },
            { label: "Violations blocked", value: "23", sub: "0 reached end-users" },
            { label: "Reviews completed", value: "21 / 23", sub: "91% within SLA" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="text-xs text-card-foreground/60 mt-0.5">{s.sub}</p>
              </div>
              <p className="text-xl font-bold">{s.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold mb-1">EU AI Act Annex IV — Technical Documentation</p>
            <p className="text-xs text-card-foreground/70">{config.aiSystemName} · auto-generated from your real audit data</p>
          </div>
          <Button onClick={() => setExported(true)} className="gap-2">
            <FileDown className="h-4 w-4" /> {exported ? "Generated" : "Generate PDF"}
          </Button>
        </div>
        {exported && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            <span>Annex-IV-{config.aiSystemName.replace(/\s+/g, "-")}-{config.callDate}.pdf · 47 pages · ready</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
