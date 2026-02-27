import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ContentCard } from "@/components/ContentCard";
import { fetchViolation } from "@/lib/api";
import { ViolationDetailCard } from "@/components/ViolationDetailCard";
import { ReviewActions } from "@/components/ReviewActions";
import { ReviewerNotesInput } from "@/components/ReviewerNotesInput";
import { SectionHeader } from "@/components/SectionHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, StickyNote, Settings } from "lucide-react";

export default function AdminViolationDetail() {
  const { id } = useParams();
  const [v, setV] = useState<any>(null);
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchViolation(id)
        .then((data) => {
          setV(data);
          if (data.status) setStatus(data.status);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <p className="text-sm text-card-foreground/50 py-10 text-center">Loading…</p>;
  if (error || !v) return (
    <div className="text-center py-20 text-muted-foreground">
      {error || "Violation not found."}{" "}
      <Link to="/admin/violations" className="text-primary hover:underline">Back to violations</Link>
    </div>
  );

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/admin/violations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Violations
        </Link>
        <SectionHeader title={`Violation ${v.id}`} description="Admin review and management" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-section items-start">
        <div className="lg:col-span-2 space-y-base">
          <ViolationDetailCard id={v.id} description={v.description} severity={v.severity} rule_id={v.rule_id} detected_at={v.detected_at} status={status} />

          <ContentCard icon={Settings} title="Admin Controls">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-card-foreground/60">Change Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-card border-card-foreground/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ContentCard>

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
