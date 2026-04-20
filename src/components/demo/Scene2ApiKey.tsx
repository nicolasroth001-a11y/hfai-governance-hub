import { motion } from "framer-motion";
import { KeyRound, Copy, CheckCircle2 } from "lucide-react";
import type { DemoConfig } from "@/lib/demoConfig";

const FAKE_KEY = "hfai_proxy_4a7c92e8b1f3d6a5c8e2f9b4d7c1a3e6";

export function Scene2ApiKey({ config }: { config: DemoConfig }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <p className="text-sm font-semibold">Your HFAI proxy key</p>
        </div>
        <p className="text-xs text-muted-foreground mb-6">Tenant-scoped · use as drop-in OpenAI / Anthropic / Gemini base URL</p>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="rounded-lg border-2 border-primary/30 bg-background p-5 font-mono text-base flex items-center justify-between">
          <span className="break-all text-foreground">{FAKE_KEY}</span>
          <button className="ml-4 p-2 rounded-md bg-primary/10 hover:bg-primary/20 shrink-0">
            <Copy className="h-4 w-4 text-primary" />
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: "Org", value: config.prospectCompany },
            { label: "Plan", value: "Free Pilot · 30d" },
            { label: "Created", value: "just now" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="text-xs font-semibold truncate">{s.value}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="flex items-center gap-2 px-4 py-3 rounded-lg border border-primary/20 bg-primary/5">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <p className="text-xs">Key stored in your env vars. Never leaves your infrastructure unencrypted.</p>
      </motion.div>
    </div>
  );
}
