import { formatDistanceToNow } from "date-fns";
import { Activity, AlertTriangle, ShieldAlert, FileText, Radio, Trash2 } from "lucide-react";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RealtimeEvent } from "@/hooks/useRealtimeSubscription";
import { motion, AnimatePresence } from "framer-motion";

const TABLE_META: Record<string, { icon: typeof Activity; label: string; color: string }> = {
  violations: { icon: ShieldAlert, label: "Violation", color: "text-destructive" },
  ai_events: { icon: Activity, label: "AI Event", color: "text-primary" },
  audit_logs: { icon: FileText, label: "Audit Log", color: "text-muted-foreground" },
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  INSERT: "Created",
  UPDATE: "Updated",
  DELETE: "Removed",
};

function getEventSummary(event: RealtimeEvent): string {
  const data = event.new as Record<string, unknown>;
  if (event.table === "violations") {
    return (data.description as string) || `Violation ${event.eventType === "INSERT" ? "detected" : "updated"}`;
  }
  if (event.table === "ai_events") {
    return `${(data.event_type as string) || "Event"}: ${((data.input_text as string) || "").slice(0, 80) || "AI event processed"}`;
  }
  if (event.table === "audit_logs") {
    return (data.details as string) || (data.action as string) || "Audit entry";
  }
  return `${event.table} ${event.eventType.toLowerCase()}`;
}

interface LiveEventFeedProps {
  events: RealtimeEvent[];
  connected: boolean;
  onClear: () => void;
}

export function LiveEventFeed({ events, connected, onClear }: LiveEventFeedProps) {
  return (
    <ContentCard
      title={
        <span className="flex items-center gap-2">
          <Radio className="h-4 w-4" />
          Live Event Stream
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connected ? "bg-success" : "bg-destructive"}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? "bg-success" : "bg-destructive"}`} />
          </span>
          <span className="text-xs font-normal text-muted-foreground ml-1">
            {connected ? "Connected" : "Connecting…"}
          </span>
        </span>
      }
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{events.length} event{events.length !== 1 ? "s" : ""}</span>
        {events.length > 0 && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground" onClick={onClear}>
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="py-10 text-center">
          <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground/60">Waiting for live events…</p>
          <p className="text-xs text-muted-foreground/40 mt-1">Send a test event or interact with your AI systems</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin">
          <AnimatePresence initial={false}>
            {events.map((event) => {
              const meta = TABLE_META[event.table] || TABLE_META.audit_logs;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-3 py-2.5 px-2 rounded-md hover:bg-muted/30 transition-colors"
                >
                  <div className={`mt-0.5 ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                        {meta.label}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                      </Badge>
                      {event.table === "violations" && event.eventType === "INSERT" && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 animate-pulse">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-card-foreground mt-1 truncate">{getEventSummary(event)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </ContentCard>
  );
}
