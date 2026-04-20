import { useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, Hash, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCENARIO_LIBRARY, type DemoConfig, type DemoScenario } from "@/lib/demoConfig";

const HASHES = [
  "a3f2e1b4c8d7…f9a2",
  "b7c4d2e8a1f3…c5d8",
  "e9f1a4c7b2d8…a1e3",
];

export function Scene6Review({ config, scenario }: { config: DemoConfig; scenario: DemoScenario }) {
  const s = SCENARIO_LIBRARY[scenario];
  const [decided, setDecided] = useState(false);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="h-5 w-5 text-primary" />
          <p className="text-sm font-semibold">Reviewer Console — {config.reviewerName}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4 mb-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Violation under review</p>
          <p className="text-sm font-semibold mb-1">{s.label}</p>
          <p className="text-xs text-card-foreground/70">{s.ruleTriggered}</p>
        </div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Reviewer notes</label>
        <div className="mt-1 mb-4 px-3 py-2 rounded-md border border-border bg-white text-xs text-neutral-900">
          Confirmed PHI exposure risk. Block stands. Recommending team training on prompt sanitization.
        </div>
        {!decided ? (
          <div className="flex gap-2">
            <Button onClick={() => setDecided(true)} className="bg-primary">Approve block</Button>
            <Button variant="outline" onClick={() => setDecided(true)}>Override</Button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/30">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold">Decision recorded · hash-chained</p>
          </motion.div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wide">Audit Chain</p>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">SHA-256 hash chain · tamper-evident</p>
        <div className="space-y-2">
          {HASHES.map((h, i) => (
            <div key={h} className="rounded border border-border bg-muted/30 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Block #{1247 + i}</p>
              <p className="text-[10px] font-mono text-card-foreground/80 break-all">{h}</p>
            </div>
          ))}
          {decided && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded border-2 border-primary/40 bg-primary/5 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-primary font-bold">Block #1250 · NEW</p>
              <p className="text-[10px] font-mono text-card-foreground break-all">d8e2f9a4c1b7…3e5f</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
