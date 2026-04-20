import { motion } from "framer-motion";
import { UserPlus, Shield, CheckCircle2, Crown } from "lucide-react";
import type { DemoConfig } from "@/lib/demoConfig";

const REVIEWERS = [
  { name: "Dr. Sarah Chen", role: "Compliance Officer", email: "sarah.chen@", type: "in_house", scope: "All violations" },
  { name: "Marcus Bell", role: "Clinical Risk Lead", email: "marcus.bell@", type: "in_house", scope: "Clinical scenarios" },
  { name: "HFAI Expert (on-call)", role: "External oversight", email: "expert@hfa-i.org", type: "hfai_appointed", scope: "Critical + override authority" },
];

export function Scene2bReviewers({ config }: { config: DemoConfig }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-card-foreground">Reviewer Team — {config.prospectCompany}</p>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Article 14 · Human Oversight</span>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Add unlimited in-house reviewers. Optionally enable HFAI's external expert for independent oversight (Sovereign tier).
        </p>

        <div className="space-y-2">
          {REVIEWERS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              className={`rounded-lg border p-4 flex items-center gap-4 ${
                r.type === "hfai_appointed"
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-muted/30"
              }`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                r.type === "hfai_appointed" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border border-border"
              }`}>
                {r.type === "hfai_appointed" ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-card-foreground">{r.name}</p>
                  {r.type === "hfai_appointed" && (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold">
                      HFAI Expert
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">{r.role} · scope: {r.scope}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-5 grid grid-cols-3 gap-3"
        >
          {[
            { v: "Unlimited", l: "In-house reviewers" },
            { v: "SHA-256", l: "Hash-chained reviews" },
            { v: "Override", l: "Authority on Sovereign" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-base font-bold text-primary">{s.v}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
