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
    <div className="space-y-section">
      <SectionHeader title="Reviewer Dashboard" description="Your violation review queue" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-base">
        <StatCard title="Assigned" value={stats.assignedViolations} icon={AlertTriangle} />
        <StatCard title="Reviewed This Week" value={stats.reviewedThisWeek} icon={CheckCircle} />
        <StatCard title="Pending Review" value={stats.pendingReview} icon={Clock} />
        <StatCard title="Avg Review Time" value={stats.avgReviewTime} icon={Timer} />
      </div>

      <ContentCard title="Violations Awaiting Review">
        <div className="space-y-3">
          {pending.map((v) => (
            <Link key={v.id} to={`/reviewer/violations/${v.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-card-foreground/5 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-primary font-medium">{v.id}</span>
                <span className="text-sm text-card-foreground line-clamp-1">{v.description}</span>
              </div>
              <div className="flex items-center gap-3">
                <SeverityBadge severity={v.severity} />
                <span className="text-xs text-card-foreground/50">{formatDistanceToNow(new Date(v.detected_at), { addSuffix: true })}</span>
              </div>
            </Link>
          ))}
        </div>
      </ContentCard>
    </div>
  );
}
