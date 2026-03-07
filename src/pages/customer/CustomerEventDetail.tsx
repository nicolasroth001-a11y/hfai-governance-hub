import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchAIEvent, fetchReviews, submitReview } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, FileText, MessageSquare, Code, PlusCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

const reviewColumns: DataTableColumn<any>[] = [
  { key: "decision", header: "Decision", render: (r) => <Badge variant={r.decision === "approved" ? "default" : "destructive"} className="capitalize text-xs">{r.decision}</Badge> },
  { key: "reviewer_name", header: "Reviewer", render: (r) => <span className="text-sm">{r.reviewer_name || "—"}</span> },
  { key: "comments", header: "Notes", render: (r) => <span className="text-sm text-card-foreground/60">{r.comments || "—"}</span> },
  { key: "created_at", header: "Time", render: (r) => <span className="text-xs text-card-foreground/50">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span> },
];

export default function CustomerEventDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ decision: "approved", comments: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!id) return;
    const [evt, allReviews] = await Promise.all([
      fetchAIEvent(id).catch(() => null),
      fetchReviews().catch(() => []),
    ]);
    setEvent(evt);
    setReviews(allReviews);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const handleCreateReview = async () => {
    if (!event) return;
    setSubmitting(true);
    try {
      await submitReview({
        violation_id: event.id, // link to the event context
        reviewer_name: profile?.name || "Reviewer",
        decision: reviewForm.decision,
        comments: reviewForm.comments,
        reviewer_id: profile?.id,
      });
      toast({ title: "Review submitted", description: `Decision: ${reviewForm.decision}` });
      setDialogOpen(false);
      setReviewForm({ decision: "approved", comments: "" });
      await loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-card-foreground/50 py-10 text-center">Loading…</p>;
  if (!event) return <p className="text-sm text-destructive py-10 text-center">Event not found.</p>;

  const metadata = event.metadata || (typeof event.payload === "object" ? event.payload : null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/customer/events" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <SectionHeader title="Event Detail" description={`Event ${event.id.slice(0, 8)}`} />
        <Badge variant="outline" className="ml-auto capitalize">{event.event_type}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard icon={MessageSquare} title="Input">
          <p className="text-sm text-card-foreground whitespace-pre-wrap">
            {event.input_text || (typeof event.payload === "string" ? event.payload : "No input recorded")}
          </p>
        </ContentCard>
        <ContentCard icon={FileText} title="Output">
          <p className="text-sm text-card-foreground whitespace-pre-wrap">
            {event.output_text || "No output recorded"}
          </p>
        </ContentCard>
      </div>

      {metadata && (
        <ContentCard icon={Code} title="Metadata">
          <pre className="text-xs text-card-foreground/70 font-mono bg-secondary/30 rounded-lg p-4 overflow-x-auto">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </ContentCard>
      )}

      <ContentCard title="Linked Reviews">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-card-foreground/60">{reviews.length} review(s)</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" /> Create Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Human Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Decision</Label>
                  <Select value={reviewForm.decision} onValueChange={(v) => setReviewForm({ ...reviewForm, decision: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Review notes…"
                    value={reviewForm.comments}
                    onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCreateReview} disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit Review"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable columns={reviewColumns} data={reviews} rowKey={(r) => r.id} emptyMessage="No reviews linked to this event" />
      </ContentCard>
    </div>
  );
}
