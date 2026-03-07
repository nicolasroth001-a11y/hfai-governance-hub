import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Clock, Timer, UserCheck } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { fetchViolations } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function ReviewerDashboard() {
  const { profile } = useAuth();
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolations()
      .then(setViolations)
      .catch(() => setViolations([]))
      .finally(() => setLoading(false));
  }, []);

  const myAssigned = violations.filter((v) => v.assigned_reviewer_id === profile?.id);
  const unassigned = violations.filter((v) => !v.assigned_reviewer_id && (v.status === "open" || v.status === "under_review"));
  const pending = [...myAssigned.filter((v) => v.status !== "resolved"), ...unassigned].slice(0, 10);

  const stats = {
    assignedToMe: myAssigned.length,
    resolved: violations.filter((v) => v.status === "resolved").length,
    pendingReview: myAssigned.filter((v) => v.status !== "resolved").length,
    unassigned: unassigned.length,
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Review Queue" description="Your assigned violations and unassigned items" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned to Me" value={stats.assignedToMe} icon={UserCheck} />
        <StatCard title="My Pending" value={stats.pendingReview} icon={Clock} />
        <StatCard title="Unassigned" value={stats.unassigned} icon={AlertTriangle} />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} />
      </div>

      <ContentCard title="My Queue">
        {loading ? (
          <p className="text-sm text-card-foreground/50">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-card-foreground/50">No pending violations. All clear!</p>
        ) : (
          <div className="space-y-1">
            {pending.map((v) => (
              <Link key={v.id} to={`/reviewer/violations/${v.id}`} className="flex items-center justify-between px-3 py-3 rounded-md hover:bg-card-foreground/[0.03] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-caption font-mono text-primary font-medium">{typeof v.id === "string" ? v.id.slice(0, 8) : v.id}</span>
                  <span className="text-body text-card-foreground line-clamp-1">{v.description}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {v.assigned_reviewer_id === profile?.id && (
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Assigned</span>
                  )}
                  <SeverityBadge severity={v.severity} />
                  <StatusBadge status={v.status || "open"} />
                  <span className="text-[11px] text-card-foreground/35">{v.detected_at ? formatDistanceToNow(new Date(v.detected_at), { addSuffix: true }) : "—"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
