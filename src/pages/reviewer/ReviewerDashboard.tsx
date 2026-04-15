import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle, Clock, UserCheck, ShieldAlert, BookOpen, Settings2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { fetchViolations } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useReviewerPermissions } from "@/hooks/useReviewerPermissions";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function ReviewerDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { permissions, can, isHFAI, isBackup } = useReviewerPermissions();
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
      <SectionHeader title={t("reviewerDashboard.title")} description={t("reviewerDashboard.description")} />

      {/* Permission Summary */}
      {permissions && (
        <ContentCard title="Your Permissions">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="text-xs">Review Violations</Badge>
            {can("can_manage_rules") && <Badge variant="secondary" className="text-xs">Manage Rules</Badge>}
            {can("can_manage_systems") && <Badge variant="secondary" className="text-xs">Manage AI Systems</Badge>}
            {can("can_approve_deployments") && <Badge variant="secondary" className="text-xs">Approve Deployments</Badge>}
            {can("can_override_decisions") && (
              <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-500">Override Authority</Badge>
            )}
          </div>
        </ContentCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t("reviewerDashboard.assignedToMe")} value={stats.assignedToMe} icon={UserCheck} />
        <StatCard title={t("reviewerDashboard.myPending")} value={stats.pendingReview} icon={Clock} />
        <StatCard title={t("reviewerDashboard.unassigned")} value={stats.unassigned} icon={AlertTriangle} />
        <StatCard title={t("reviewerDashboard.resolved")} value={stats.resolved} icon={CheckCircle} />
      </div>

      <ContentCard title={t("reviewerDashboard.myQueue")}>
        {loading ? (
          <p className="text-sm text-card-foreground/50">{t("reviewerDashboard.loading")}</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-card-foreground/50">{t("reviewerDashboard.noPending")}</p>
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
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">{t("reviewerDashboard.assigned")}</span>
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
