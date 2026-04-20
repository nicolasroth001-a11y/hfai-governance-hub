import { motion } from "framer-motion";
import { Bot, ShieldAlert, User } from "lucide-react";
import { SCENARIO_LIBRARY, type DemoConfig, type DemoScenario } from "@/lib/demoConfig";

export function Scene5bUserView({ config, scenario }: { config: DemoConfig; scenario: DemoScenario }) {
  const s = SCENARIO_LIBRARY[scenario];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-card-foreground">{config.aiSystemName}</p>
          </div>
          <span className="text-[10px] text-muted-foreground">End-user view · what the patient / staff member sees</span>
        </div>

        <div className="p-6 space-y-4 min-h-[340px]">
          {/* User message */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                {s.prompt}
              </div>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </motion.div>

          {/* AI response — graceful fallback */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-start"
          >
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-card-foreground">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-500">
                    Response withheld for review
                  </span>
                </div>
                <p className="leading-relaxed">
                  I can't provide that information directly. This request involves protected data and has been flagged for compliance review.
                  A team member will follow up — your question has been logged with reference{" "}
                  <span className="font-mono text-xs">#HFAI-{Math.floor(Math.random() * 9000) + 1000}</span>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Internal banner shown to admin only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-[11px] text-muted-foreground flex items-center gap-2"
          >
            <span className="font-semibold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded bg-card border border-border">
              admin-only
            </span>
            Original AI output blocked: <span className="font-mono italic">"{s.aiResponse.slice(0, 80)}…"</span> · {s.latency}ms · {s.ruleTriggered}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { v: "0", l: "PHI exposed" },
          { v: "0", l: "Liability incurred" },
          { v: "100%", l: "Audit-trail captured" },
        ].map((m) => (
          <div key={m.l} className="rounded-lg border border-primary/20 bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{m.v}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{m.l}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
