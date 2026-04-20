import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCENARIO_LIBRARY, type DemoConfig, type DemoScenario } from "@/lib/demoConfig";

export function Scene5Violation({ config, scenario }: { config: DemoConfig; scenario: DemoScenario }) {
  const s = SCENARIO_LIBRARY[scenario];
  const [stage, setStage] = useState<"idle" | "sending" | "blocked">("idle");

  useEffect(() => { setStage("idle"); }, [scenario]);

  const fire = () => {
    setStage("sending");
    setTimeout(() => setStage("blocked"), 700);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Inbound prompt to {config.aiSystemName}</p>
        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-500/5 p-4">
          <p className="text-sm font-mono text-card-foreground italic">"{s.prompt}"</p>
        </div>
        {stage === "idle" && (
          <Button onClick={fire} className="mt-4 gap-2 bg-primary">
            <Zap className="h-4 w-4" /> Fire prompt
          </Button>
        )}
        {stage === "sending" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            HFAI inspecting…
          </motion.div>
        )}
      </div>

      {stage === "blocked" && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="rounded-xl border-2 border-destructive bg-destructive/5 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-base font-bold text-destructive">BLOCKED</p>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-destructive/20 text-destructive">{s.latency}ms</span>
              </div>
              <p className="text-xs font-semibold">{s.category}</p>
            </div>
          </div>
          <p className="text-xs text-card-foreground/80 leading-relaxed mb-4">{s.blockedReason}</p>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <Cell label="Rule" value={s.ruleTriggered} />
            <Cell label="EU AI Act" value={s.euArticle} />
            <Cell label="HIPAA" value={s.hipaaRef} />
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-4 flex items-center gap-2 text-xs text-card-foreground/70">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            User received: graceful fallback message · audit log entry written · no PHI exposed
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-card px-2 py-1.5">
      <p className="text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-mono text-card-foreground/90 truncate">{value}</p>
    </div>
  );
}
