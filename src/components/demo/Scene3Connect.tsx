import { motion } from "framer-motion";
import { Plug, ArrowRight } from "lucide-react";
import type { DemoConfig } from "@/lib/demoConfig";

export function Scene3Connect({ config }: { config: DemoConfig }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex items-center gap-2 mb-4">
          <Plug className="h-5 w-5 text-primary" />
          <p className="text-sm font-semibold">Connect {config.aiSystemName}</p>
        </div>
        <p className="text-xs text-muted-foreground mb-6">One line. That's the entire integration.</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Before</p>
            <pre className="rounded-lg bg-muted/40 border border-border p-4 text-[11px] font-mono leading-relaxed overflow-x-auto">
{`const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  baseURL: "https://api.openai.com/v1"
});`}
            </pre>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-2">After</p>
            <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="rounded-lg bg-primary/5 border-2 border-primary/30 p-4 text-[11px] font-mono leading-relaxed overflow-x-auto">
{`const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  `}<span className="bg-primary/20 px-1 rounded">baseURL: "https://proxy.hfa-i.org/v1"</span>{`
});`}
            </motion.pre>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        className="grid grid-cols-3 gap-3">
        {[
          { label: "Latency added", value: "12ms p99" },
          { label: "Code changes", value: "1 line" },
          { label: "Vendor lock-in", value: "Zero" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.15 }}
            className="rounded-lg border border-primary/20 bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
        className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <span className="px-3 py-1 rounded border border-border">Your app</span>
        <ArrowRight className="h-3 w-3" />
        <span className="px-3 py-1 rounded border border-primary bg-primary/10 text-primary font-semibold">HFAI</span>
        <ArrowRight className="h-3 w-3" />
        <span className="px-3 py-1 rounded border border-border">{config.aiProvider}</span>
      </motion.div>
    </div>
  );
}
