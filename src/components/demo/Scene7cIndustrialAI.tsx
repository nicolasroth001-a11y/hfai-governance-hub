import { motion } from "framer-motion";
import { Factory, Cpu, Camera, Wrench, ShieldCheck, AlertTriangle } from "lucide-react";
import type { DemoConfig } from "@/lib/demoConfig";

export function Scene7cIndustrialAI({ config: _config }: { config: DemoConfig }) {
  const useCases = [
    { icon: Factory, title: "Factory-floor robotics", sub: "ISO 23482 safety envelope · emergency-stop telemetry" },
    { icon: Camera, title: "Computer-vision QC", sub: "Defect classifier drift + false-pass guardrails" },
    { icon: Wrench, title: "Predictive maintenance", sub: "Model confidence floor before auto-dispatch" },
    { icon: Cpu, title: "Autonomous mobile units", sub: "Geofence + human-proximity hard-blocks" },
  ];

  const standards = [
    { code: "ISO 23482", label: "Personal-care robot safety" },
    { code: "IEC 61508", label: "Functional safety (SIL)" },
    { code: "ISO 13849", label: "Machinery safety controls" },
    { code: "OSHA 1910", label: "Worker protection" },
  ];

  return (
    <div className="space-y-4">
      {/* Headline card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">
              Beyond chatbots — Industrial AI Governance
            </p>
            <h3 className="text-lg font-bold text-card-foreground leading-tight">
              The 80% of AI no governance vendor covers
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
              Most "AI governance" platforms only see LLM text. HFAI also governs the physical
              AI stack — robotics, computer vision, predictive maintenance — where a failure
              isn't a bad answer, it's an injury.
            </p>
          </div>
          <div className="hidden sm:flex h-12 w-12 rounded-xl bg-primary/10 items-center justify-center shrink-0">
            <Factory className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Use cases */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          {useCases.map((u, i) => {
            const Icon = u.icon;
            return (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="rounded-lg border border-border bg-background/60 p-3 flex items-start gap-3"
              >
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-card-foreground">{u.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{u.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Standards strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-border bg-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-card-foreground">Standards mapped out of the box</p>
        </div>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
          {standards.map((s) => (
            <div key={s.code} className="rounded-lg border border-border bg-background/60 p-2.5 text-center">
              <p className="text-[10px] font-bold text-primary tracking-wider">{s.code}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Why it matters callout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="rounded-xl border-2 border-primary/50 bg-card p-5 flex items-start gap-3 shadow-sm"
      >
        <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-foreground">Why this matters</p>
          <p className="text-sm text-foreground font-medium mt-1.5 leading-relaxed">
            A hallucinated chatbot reply is embarrassing. A misclassified weld, a missed proximity
            event, or a runaway autonomous unit is an OSHA filing — or a fatality.
            HFAI extends the same hash-chained, human-in-the-loop oversight to the AI systems
            that touch the physical world.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
