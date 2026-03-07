import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Clock, Timer } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { fetchViolations } from "@/lib/api";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function ReviewerDashboard() {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolations()
      .then(setViolations)
      .catch(() => setViolations([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = violations.filter((v) => v.status === "open" || v.status === "under_review").slice(0, 5);
  const stats = {
    assignedViolations: violations.length,
    reviewedThisWeek: violations.filter((v: any) => v.status === "resolved").length,
    pendingReview: pending.length,
    avgReviewTime: "—",
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Review Queue" description="Speed and decision-making for pending violations" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Violations" value={stats.assignedViolations} icon={AlertTriangle} />
        <StatCard title="Resolved" value={stats.reviewedThisWeek} icon={CheckCircle} />
        <StatCard title="Pending Review" value={stats.pendingReview} icon={Clock} />
        <StatCard title="Avg Review Time" value={stats.avgReviewTime} icon={Timer} />
      </div>

      <ContentCard title="Awaiting Review">
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
                  <SeverityBadge severity={v.severity} />
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