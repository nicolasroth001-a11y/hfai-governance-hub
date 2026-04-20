import { motion } from "framer-motion";
import { KeyRound, Copy, CheckCircle2, Server, Code2 } from "lucide-react";
import type { DemoConfig } from "@/lib/demoConfig";

const FAKE_KEY = "hfai_proxy_4a7c92e8b1f3d6a5c8e2f9b4d7c1a3e6";

export function Scene2ApiKey({ config }: { config: DemoConfig }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <p className="text-sm font-semibold text-card-foreground">Your HFAI proxy key</p>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Tenant-scoped · drop-in replacement for OpenAI / Anthropic / Gemini base URL
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border-2 border-primary/40 bg-primary/5 p-5 font-mono text-base flex items-center justify-between"
        >
          <span className="break-all text-foreground">{FAKE_KEY}</span>
          <button className="ml-4 p-2 rounded-md bg-primary/15 hover:bg-primary/25 shrink-0">
            <Copy className="h-4 w-4 text-primary" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-3 mt-6"
        >
          {[
            { label: "Org", value: config.prospectCompany },
            { label: "Plan", value: "Free Pilot · 30d" },
            { label: "Created", value: "just now" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-muted/40 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="text-xs font-semibold text-card-foreground truncate">{s.value}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Both sides — Customer side + HFAI side */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-card-foreground">Customer side · your env</p>
          </div>
          <pre className="rounded-md bg-muted/50 border border-border p-3 text-[11px] font-mono leading-relaxed text-foreground overflow-x-auto">
{`HFAI_PROXY_KEY=hfai_proxy_4a7c92e…
HFAI_BASE_URL=https://proxy.hfa-i.org/v1`}
          </pre>
          <p className="text-[10px] text-muted-foreground mt-2">Stored in your env vars · never leaves your infrastructure unencrypted.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Server className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-card-foreground">HFAI side · what we provision</p>
          </div>
          <ul className="space-y-1.5 text-[11px] text-card-foreground/80">
            {[
              "Isolated Postgres tenant + RLS policies",
              "Default rule pack (HIPAA + EU AI Act + ISO 42001)",
              "Audit chain initialized (genesis hash)",
              "Compliance dashboard + Annex IV ready",
              "Webhooks + Slack / email channels armed",
            ].map((s) => (
              <li key={s} className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
