import { motion } from "framer-motion";
import { Shield, CheckCircle2 } from "lucide-react";
import type { DemoConfig } from "@/lib/demoConfig";

export function Scene1Signup({ config }: { config: DemoConfig }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold tracking-tight">HFAI</span>
          <span className="text-xs text-muted-foreground ml-auto">Sign up</span>
        </div>
        <h2 className="text-2xl font-bold mb-1">Create your account</h2>
        <p className="text-sm text-muted-foreground mb-6">Free pilot · 30 days · no card</p>
        <div className="space-y-3">
          <Field label="Full name" value={config.prospectName} delay={0.3} />
          <Field label="Work email" value={config.prospectEmail} delay={0.6} />
          <Field label="Company" value={config.prospectCompany} delay={0.9} />
          <Field label="Password" value="••••••••••••" delay={1.2} />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
            className="bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-semibold text-center mt-4">
            Create account
          </motion.div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.8 }}
        className="rounded-xl border border-primary/30 bg-primary/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <p className="font-semibold text-sm">Org provisioned · 847ms</p>
        </div>
        <ul className="space-y-2 text-xs">
          {["Postgres tenant created with RLS isolation","Org-scoped API key generated","Default rule pack loaded (HIPAA + EU AI Act)","Audit log initialized","Compliance dashboard ready"].map((s, i) => (
            <motion.li key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2 + i * 0.15 }} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-card-foreground/80">{s}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

function Field({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</label>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}
        className="mt-1 px-3 py-2 rounded-md border border-border bg-background text-sm">
        {value}
      </motion.div>
    </div>
  );
}
