import { useEffect, useState } from "react";
import { Card as ShadcnCard } from "@/components/ui/card";
import { fetchReviews, fetchAuditLogs } from "@/lib/api";
import { mockAuditTrailByViolation, mockAuditLogs } from "@/lib/mock-data";
import { format, formatDistanceToNow } from "date-fns";
import { History, CheckCircle, XCircle, Clock, MessageSquare, Activity } from "lucide-react";

interface AuditTrailCardProps {
  violationId: string | number;
}

interface TrailEntry {
  id: string;
  timestamp: string;
  type: "review" | "audit";
  action: string;
  actor: string;
  details: string;
}

export function AuditTrailCard({ violationId }: AuditTrailCardProps) {
  const [entries, setEntries] = useState<TrailEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const vId = String(violationId);

    Promise.all([
      fetchReviews().catch(() => []),
      fetchAuditLogs().catch(() => mockAuditLogs),
    ]).then(([reviews, logs]) => {
      const reviewEntries: TrailEntry[] = (reviews as any[])
        .filter((r) => String(r.violation_id) === vId)
        .map((r) => ({
          id: `review-${r.id}`,
          timestamp: r.reviewed_at || r.created_at,
          type: "review" as const,
          action: r.decision || "reviewed",
          actor: r.reviewer_name || "Unknown",
          details: r.comments || "No comments",
        }));

      const auditEntries: TrailEntry[] = (logs as any[])
        .filter((l) => l.entity_type === "violation" && String(l.entity_id) === vId)
        .map((l) => ({
          id: `audit-${l.id}`,
          timestamp: l.created_at,
          type: "audit" as const,
          action: l.action,
          actor: "System",
          details: l.details || "",
        }));

      let all = [...reviewEntries, ...auditEntries];

      // If no entries found from API/mockAuditLogs, use per-violation mock trail
      if (all.length === 0 && mockAuditTrailByViolation[vId]) {
        all = mockAuditTrailByViolation[vId].map((l) => ({
          id: `audit-${l.id}`,
          timestamp: l.created_at,
          type: "audit" as const,
          action: l.action,
          actor: "System",
          details: l.details,
        }));
      }

      all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEntries(all);
      setLoading(false);
    });
  }, [violationId]);

  const getIcon = (entry: TrailEntry) => {
    if (entry.type === "review") {
      if (entry.action === "approve") return <CheckCircle className="h-3.5 w-3.5 text-success" />;
      if (entry.action === "reject") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
      return <MessageSquare className="h-3.5 w-3.5 text-info" />;
    }
    return <Activity className="h-3.5 w-3.5 text-primary/70" />;
  };

  const formatAction = (entry: TrailEntry) => {
    if (entry.type === "review") {
      if (entry.action === "approve") return "Approved";
      if (entry.action === "reject") return "Rejected";
      return entry.action.replace(/_/g, " ");
    }
    return entry.action.replace(/_/g, " ");
  };

  return (
    <ShadcnCard className="p-card overflow-hidden">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-card-foreground/6">
        <History className="h-4 w-4 text-primary/80" />
        <h2 className="text-section text-card-foreground">Audit Trail</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-4 w-4 rounded-full bg-card-foreground/5 animate-pulse shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 rounded bg-card-foreground/5 animate-pulse" style={{ width: `${60 - i * 10}%` }} />
                <div className="h-3 rounded bg-card-foreground/5 animate-pulse" style={{ width: `${40 - i * 5}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-6">
          <Clock className="h-8 w-8 text-card-foreground/15 mx-auto mb-2" />
          <p className="text-xs text-card-foreground/40">No audit trail entries yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry, index) => (
            <div key={entry.id} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
              <div className="flex flex-col items-center pt-0.5">
                {getIcon(entry)}
                {index < entries.length - 1 && (
                  <div className="w-px flex-1 bg-card-foreground/8 mt-1.5" />
                )}
              </div>
              <div className="pb-5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-card-foreground capitalize">
                    {formatAction(entry)}
                  </span>
                  <span className="text-[11px] text-card-foreground/35">by {entry.actor}</span>
                </div>
                {entry.details && (
                  <p className="text-xs text-card-foreground/50 mt-0.5 leading-relaxed">{entry.details}</p>
                )}
                <p className="text-[11px] text-card-foreground/30 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {(() => {
                    try {
                      return `${format(new Date(entry.timestamp), "MMM d, yyyy HH:mm")} · ${formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}`;
                    } catch {
                      return entry.timestamp;
                    }
                  })()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ShadcnCard>
  );
}
