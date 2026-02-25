import { useParams, Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { StatCard } from "@/components/StatCard";
import { mockReviewers } from "@/lib/mock-data";
import { ArrowLeft, AlertTriangle, CheckCircle, User } from "lucide-react";

export default function AdminReviewerDetail() {
  const { id } = useParams();
  const reviewer = mockReviewers.find((r) => r.id === id) || mockReviewers[0];

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/admin/reviewers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Reviewers
        </Link>
        <SectionHeader title={reviewer.name} description={reviewer.role} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-base">
        <StatCard title="Assigned" value={reviewer.assigned_violations} icon={AlertTriangle} />
        <StatCard title="Total Reviewed" value={reviewer.reviewed_total} icon={CheckCircle} />
        <StatCard title="Status" value={reviewer.status} icon={User} />
      </div>

      <ContentCard title="Reviewer Information">
        <div className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-card-foreground/60">Email</span><span className="text-card-foreground">{reviewer.email}</span></div>
          <div className="border-t border-primary/10" />
          <div className="flex justify-between text-sm"><span className="text-card-foreground/60">Role</span><span className="text-card-foreground">{reviewer.role}</span></div>
          <div className="border-t border-primary/10" />
          <div className="flex justify-between text-sm"><span className="text-card-foreground/60">Status</span><span className="text-card-foreground">{reviewer.status}</span></div>
        </div>
      </ContentCard>
    </div>
  );
}
