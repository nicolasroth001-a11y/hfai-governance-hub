import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ContentCard } from "@/components/ContentCard";
import { fetchViolation, updateViolation, fetchAdminReviewers } from "@/lib/api";
import { ViolationSummaryCard } from "@/components/ViolationSummaryCard";
import { AISystemInfoCard } from "@/components/AISystemInfoCard";
import { EventPayloadCard } from "@/components/EventPayloadCard";
import { AuditTrailCard } from "@/components/AuditTrailCard";
import { ReviewActions } from "@/components/ReviewActions";
import { ReviewerNotesInput } from "@/components/ReviewerNotesInput";
import { RCASection } from "@/components/RCASection";
import { SectionHeader } from "@/components/SectionHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, StickyNote, Settings, Gavel, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminViolationDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [v, setV] = useState<any>(null);
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [auditKey, setAuditKey] = useState(0);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [assignedReviewer, setAssignedReviewer] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchViolation(id)
        .then((data) => {
          setV(data);
          if (data.status) setStatus(data.status);
          setAssignedReviewer(data.assigned_reviewer_id || "");
        })
        .catch((err) => setError(err.message || "Failed to load violation"))
        .finally(() => setLoading(false));
    }
    fetchAdminReviewers().then(setReviewers).catch(() => {});
  }, [id]);

  const refreshAudit = useCallback(() => setAuditKey((k) => k + 1), []);

  const handleDecision = useCallback((decision: "approve" | "reject") => {
    setStatus("resolved");
    refreshAudit();
  }, [refreshAudit]);

  const handleAssignReviewer = async (reviewerId: string) => {
    if (!id) return;
    setAssignedReviewer(reviewerId);
    try {
      await updateViolation(id, { assigned_reviewer_id: reviewerId || null });
      toast({ title: t("adminViolationDetail.reviewerAssigned"), description: t("adminViolationDetail.reviewerAssignedDesc") });
    } catch (err: any) {
      toast({ title: t("adminViolationDetail.error"), description: err.message, variant: "destructive" });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    setStatus(newStatus);
    try {
      await updateViolation(id, { status: newStatus });
      toast({ title: t("adminViolationDetail.statusUpdated"), description: t("adminViolationDetail.statusUpdatedDesc", { status: newStatus }) });
    } catch (err: any) {
      toast({ title: t("adminViolationDetail.error"), description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <p className="text-sm text-card-foreground/50 py-10 text-center">{t("adminViolationDetail.loading")}</p>;
  if (error || !v) return (
    <div className="text-center py-20 text-muted-foreground">
      {error || t("adminViolationDetail.notFound")}{" "}
      <Link to="/admin/violations" className="text-primary hover:underline">{t("adminViolationDetail.backToViolations")}</Link>
    </div>
  );

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/admin/violations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("adminViolationDetail.backToViolations")}
        </Link>
        <SectionHeader title={t("adminViolationDetail.violationTitle", { id: typeof v.id === "string" ? v.id.slice(0, 8) : v.id })} description={t("adminViolationDetail.description")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-base">
        <ViolationSummaryCard
          id={v.id} description={v.description} severity={v.severity}
          rule_id={v.rule_id} detected_at={v.detected_at} status={status}
        />
        <AISystemInfoCard aiSystemId={v.ai_system_id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-base items-start">
        <div className="lg:col-span-3">
          <EventPayloadCard data={v} />
        </div>
        <div className="lg:col-span-2 space-y-base">
          <ContentCard icon={Settings} title={t("adminViolationDetail.adminControls")}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-card-foreground/60">{t("adminViolationDetail.changeStatus")}</label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="bg-card border-card-foreground/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{t("adminViolations.open")}</SelectItem>
                    <SelectItem value="under_review">{t("adminViolations.underReview")}</SelectItem>
                    <SelectItem value="resolved">{t("adminViolations.resolved")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ContentCard>
          <ContentCard icon={UserCheck} title={t("adminViolationDetail.assignReviewer")}>
            <div className="space-y-2">
              <label className="text-xs font-medium text-card-foreground/60">{t("adminViolationDetail.assignedReviewer")}</label>
              <Select value={assignedReviewer} onValueChange={handleAssignReviewer}>
                <SelectTrigger className="bg-card border-card-foreground/10">
                  <SelectValue placeholder={t("adminViolationDetail.selectReviewer")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">{t("adminViolationDetail.unassigned")}</SelectItem>
                  {reviewers.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name || r.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ContentCard>
          <ContentCard icon={Gavel} title={t("adminViolationDetail.reviewActions")}>
            <ReviewActions violationId={String(v.id)} onDecision={handleDecision} />
          </ContentCard>
          <ContentCard icon={StickyNote} title={t("adminViolationDetail.reviewerNotes")}>
            <ReviewerNotesInput violationId={String(v.id)} onSubmit={refreshAudit} />
          </ContentCard>
        </div>
      </div>

      <RCASection violationId={String(v.id)} canEdit />

      <AuditTrailCard key={auditKey} violationId={v.id} />
    </div>
  );
}
