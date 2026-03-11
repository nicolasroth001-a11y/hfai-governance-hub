import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { RealtimeEvent } from "@/hooks/useRealtimeSubscription";

interface RealtimeStatsProps {
  events: RealtimeEvent[];
}

export function RealtimeStats({ events }: RealtimeStatsProps) {
  const [flash, setFlash] = useState<string | null>(null);

  const violationInserts = events.filter((e) => e.table === "violations" && e.eventType === "INSERT").length;
  const aiEventInserts = events.filter((e) => e.table === "ai_events" && e.eventType === "INSERT").length;
  const resolvedUpdates = events.filter(
    (e) => e.table === "violations" && e.eventType === "UPDATE" && (e.new as any).status === "resolved"
  ).length;

  useEffect(() => {
    if (events.length > 0) {
      const latest = events[0];
      setFlash(latest.id);
      const timeout = setTimeout(() => setFlash(null), 1000);
      return () => clearTimeout(timeout);
    }
  }, [events.length]);

  const stats = [
    { label: "Live Violations", value: violationInserts, color: "text-destructive" },
    { label: "AI Events", value: aiEventInserts, color: "text-primary" },
    { label: "Resolved", value: resolvedUpdates, color: "text-success" },
    { label: "Total Stream", value: events.length, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          className="rounded-lg border border-border bg-card p-3 text-center"
          animate={flash ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
