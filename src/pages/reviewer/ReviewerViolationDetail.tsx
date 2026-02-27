import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { fetchViolation } from "@/lib/api";
import { ContentCard } from "@/components/ContentCard";
import { ViolationSummaryCard } from "@/components/ViolationSummaryCard";
import { AISystemInfoCard } from "@/components/AISystemInfoCard";
import { EventPayloadCard } from "@/components/EventPayloadCard";
import { AuditTrailCard } from "@/components/AuditTrailCard";
import { ReviewActions } from "@/components/ReviewActions";
import { ReviewerNotesInput } from "@/components/ReviewerNotesInput";
import { SectionHeader } from "@/components/SectionHeader";
import { ArrowLeft, Gavel, StickyNote } from "lucide-react";

export default function ReviewerViolationDetail() {
  const { id } = useParams();
  const [v, setV] = useState<any>(null);
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [auditKey, setAuditKey] = useState(0);

  useEffect(() => {
    if (id) {
      fetchViolation(id)
        .then((data) => { setV(data); setStatus(data.status || "open"); })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const refreshAudit = useCallback(() => setAuditKey((k) => k + 1), []);

  const handleDecision = useCallback((decision: "approve" | "reject") => {
    setStatus(decision === "approve" ? "resolved" : "resolved");
    refreshAudit();
  }, [refreshAudit]);

  if (loading) return <p className="text-sm text-card-foreground/50 py-10 text-center">Loading…</p>;
  if (error || !v) return (
    <div className="text-center py-20 text-muted-foreground">
      {error || "Violation not found."}{" "}
      <Link to="/reviewer/violations" className="text-primary hover:underline">Back to violations</Link>
    </div>
  );

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/reviewer/violations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Violations
        </Link>
        <SectionHeader title={`Violation #${v.id}`} description="Review and take action" />
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
          <ContentCard icon={Gavel} title="Review Actions">
            <ReviewActions violationId={String(v.id)} onDecision={handleDecision} />
          </ContentCard>
          <ContentCard icon={StickyNote} title="Reviewer Notes">
            <ReviewerNotesInput violationId={String(v.id)} onSubmit={refreshAudit} />
          </ContentCard>
        </div>
      </div>

      <AuditTrailCard key={auditKey} violationId={v.id} />
    </div>
  );
}
