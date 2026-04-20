import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import type { DemoConfig } from "@/lib/demoConfig";

const SAMPLE_EVENTS = [
  { type: "chat.completion", input: "What are visiting hours for ICU?", output: "ICU visiting hours are 11am-1pm and 5pm-8pm daily.", latency: 234 },
  { type: "chat.completion", input: "Help me schedule a follow-up appointment", output: "I can help with that. What date works best?", latency: 189 },
  { type: "chat.completion", input: "What's covered under my insurance plan?", output: "I'll need to check your plan details. Could you provide…", latency: 312 },
  { type: "embedding", input: "Patient discharge instructions for procedure XYZ", output: "[1536-dim vector]", latency: 87 },
  { type: "chat.completion", input: "Summarize the latest lab results", output: "Your recent lab results show all values within normal range…", latency: 421 },
];

export function Scene4EventFlow({ config }: { config: DemoConfig }) {
  const [events, setEvents] = useState<typeof SAMPLE_EVENTS>([]);

  useEffect(() => {
    setEvents([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= SAMPLE_EVENTS.length) { clearInterval(interval); return; }
      setEvents((prev) => [SAMPLE_EVENTS[i], ...prev]);
      i++;
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Live Events · {config.aiSystemName}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Streaming</span>
        </div>
      </div>
      <div className="divide-y divide-border min-h-[400px]">
        <AnimatePresence>
          {events.map((e, i) => (
            <motion.div key={i + e.input} initial={{ opacity: 0, y: -10, backgroundColor: "hsl(var(--primary) / 0.1)" }}
              animate={{ opacity: 1, y: 0, backgroundColor: "transparent" }} transition={{ duration: 0.6 }}
              className="px-6 py-3 flex items-start gap-4">
              <span className="text-[10px] font-mono text-muted-foreground mt-0.5 shrink-0">{new Date().toLocaleTimeString()}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono shrink-0">{e.type}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-card-foreground truncate">→ {e.input}</p>
                <p className="text-xs text-muted-foreground truncate">← {e.output}</p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground shrink-0">{e.latency}ms</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {events.length === 0 && (
          <div className="px-6 py-12 text-center text-xs text-muted-foreground">Waiting for first event…</div>
        )}
      </div>
    </div>
  );
}
