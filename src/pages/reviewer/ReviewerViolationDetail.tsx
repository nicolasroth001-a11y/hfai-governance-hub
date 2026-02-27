import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchViolation } from "@/lib/api";
import { ContentCard } from "@/components/ContentCard";
import { ViolationDetailCard } from "@/components/ViolationDetailCard";
import { ReviewActions } from "@/components/ReviewActions";
import { ReviewerNotesInput } from "@/components/ReviewerNotesInput";
import { SectionHeader } from "@/components/SectionHeader";
import { ArrowLeft, StickyNote } from "lucide-react";

export default function ReviewerViolationDetail() {
  const { id } = useParams();
  const [v, setV] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchViolation(id)
        .then(setV)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

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
        <SectionHeader title={`Violation ${v.id}`} description="Review and take action" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-section items-start">
        <div className="lg:col-span-2 space-y-base">
          <ViolationDetailCard id={v.id} description={v.description} severity={v.severity} rule_id={v.rule_id} detected_at={v.detected_at} status={v.status || "open"} />
          <ContentCard title="Review Actions">
            <ReviewActions violationId={String(v.id)} />
          </ContentCard>
          <ContentCard icon={StickyNote} title="Reviewer Notes">
            <ReviewerNotesInput violationId={String(v.id)} />
          </ContentCard>
        </div>
        <div className="lg:col-span-3 space-y-base">
          <ContentCard title="Violation Data">
            <pre className="text-xs text-card-foreground/70 font-mono whitespace-pre-wrap">{JSON.stringify(v, null, 2)}</pre>
          </ContentCard>
        </div>
      </div>
    </div>
  );
}
