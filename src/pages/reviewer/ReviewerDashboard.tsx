import { AlertTriangle, CheckCircle, Clock, Timer } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { mockViolations, mockReviewerStats } from "@/lib/mock-data";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function ReviewerDashboard() {
  const stats = mockReviewerStats;
  const pending = mockViolations.filter((v) => v.status === "open" || v.status === "under_review").slice(0, 5);

  return (
    <div className="space-y-8">
      <SectionHeader title="Review Queue" description="Speed and decision-making for pending violations" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned" value={stats.assignedViolations} icon={AlertTriangle} />
        <StatCard title="Reviewed This Week" value={stats.reviewedThisWeek} icon={CheckCircle} />
        <StatCard title="Pending Review" value={stats.pendingReview} icon={Clock} />
        <StatCard title="Avg Review Time" value={stats.avgReviewTime} icon={Timer} />
      </div>

      <ContentCard title="Awaiting Your Review">
        <div className="space-y-1">
          {pending.map((v) => (
            <Link key={v.id} to={`/reviewer/violations/${v.id}`} className="flex items-center justify-between px-3 py-3 rounded-md hover:bg-card-foreground/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-caption font-mono text-primary font-medium">{v.id}</span>
                <span className="text-body text-card-foreground line-clamp-1">{v.description}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <SeverityBadge severity={v.severity} />
                <span className="text-[11px] text-card-foreground/35">{formatDistanceToNow(new Date(v.detected_at), { addSuffix: true })}</span>
              </div>
            </Link>
          ))}
        </div>
      </ContentCard>
    </div>
  );
}
