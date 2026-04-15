import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { fetchViolation, fetchReviews } from "@/lib/api";
import { ContentCard } from "@/components/ContentCard";
import { ViolationSummaryCard } from "@/components/ViolationSummaryCard";
import { AISystemInfoCard } from "@/components/AISystemInfoCard";
import { EventPayloadCard } from "@/components/EventPayloadCard";
import { AuditTrailCard } from "@/components/AuditTrailCard";
import { ReviewActions } from "@/components/ReviewActions";
import { ReviewerNotesInput } from "@/components/ReviewerNotesInput";
import { RCASection } from "@/components/RCASection";
import { SectionHeader } from "@/components/SectionHeader";
import { OverrideAction, OverrideHistory } from "@/components/OverrideAction";
import { useReviewerPermissions } from "@/hooks/useReviewerPermissions";
import { ArrowLeft, Gavel, StickyNote } from "lucide-react";

export default function ReviewerViolationDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [v, setV] = useState<any>(null);
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [auditKey, setAuditKey] = useState(0);
  const [latestReview, setLatestReview] = useState<{ id: string; decision: string; reviewer_name: string } | null>(null);
  const { can } = useReviewerPermissions();

  useEffect(() => {
    if (id) {
      fetchViolation(id)
        .then((data) => { setV(data); setStatus(data.status || "open"); })
        .catch((err) => setError(err.message || "Failed to load violation"))
        .finally(() => setLoading(false));

      // Fetch latest review for override capability
      fetchReviews()
        .then((reviews) => {
          const relevant = reviews
            .filter((r: any) => r.violation_id === id && r.decision && r.decision !== "pending")
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          if (relevant.length > 0) {
            setLatestReview({
              id: relevant[0].id,
              decision: relevant[0].decision,
              reviewer_name: relevant[0].reviewer_name || "",
            });
          }
        })
        .catch(() => {});
    }
  }, [id]);

  const refreshAudit = useCallback(() => setAuditKey((k) => k + 1), []);

  const handleDecision = useCallback((decision: "approve" | "reject") => {
    setStatus("resolved");
    refreshAudit();
  }, [refreshAudit]);

  if (loading) return <p className="text-sm text-card-foreground/50 py-10 text-center">{t("reviewerViolationDetail.loading")}</p>;
  if (error || !v) return (
    <div className="text-center py-20 text-muted-foreground">
      {error || t("reviewerViolationDetail.notFound")}{" "}
      <Link to="/reviewer/violations" className="text-primary hover:underline">{t("reviewerViolationDetail.backToViolations")}</Link>
    </div>
  );

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/reviewer/violations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("reviewerViolationDetail.backToViolations")}
        </Link>
        <SectionHeader title={t("reviewerViolationDetail.violationTitle", { id: typeof v.id === "string" ? v.id.slice(0, 8) : v.id })} description={t("reviewerViolationDetail.description")} />
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
          <ContentCard icon={Gavel} title={t("reviewerViolationDetail.reviewActions")}>
            <ReviewActions violationId={String(v.id)} onDecision={handleDecision} />
            {can("can_override_decisions") && latestReview && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <OverrideAction
                  violationId={String(v.id)}
                  orgId={v.org_id}
                  latestReview={latestReview}
                  onOverride={refreshAudit}
                />
              </div>
            )}
          </ContentCard>
          <ContentCard icon={StickyNote} title={t("reviewerViolationDetail.reviewerNotes")}>
            <ReviewerNotesInput violationId={String(v.id)} onSubmit={refreshAudit} />
          </ContentCard>
        </div>
      </div>

      <RCASection violationId={String(v.id)} canEdit />

      <OverrideHistory violationId={String(v.id)} />

      <AuditTrailCard key={auditKey} violationId={v.id} />
    </div>
  );
}
