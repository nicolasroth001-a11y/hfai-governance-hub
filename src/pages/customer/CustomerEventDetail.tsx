import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

export default function CustomerEventDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { profile } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ decision: "approved", comments: "" });
  const [submitting, setSubmitting] = useState(false);

  const reviewColumns: DataTableColumn<any>[] = [
    { key: "decision", header: t("customerEventDetail.decision"), render: (r) => <Badge variant={r.decision === "approved" ? "default" : "destructive"} className="capitalize text-xs">{r.decision}</Badge> },
    { key: "reviewer_name", header: t("customerEventDetail.reviewer"), render: (r) => <span className="text-sm">{r.reviewer_name || "—"}</span> },
    { key: "comments", header: t("customerEventDetail.notes"), render: (r) => <span className="text-sm text-card-foreground/60">{r.comments || "—"}</span> },
    { key: "created_at", header: t("customerEvents.time"), render: (r) => <span className="text-xs text-card-foreground/50">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span> },
  ];

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
        violation_id: event.id,
        reviewer_name: profile?.name || "Reviewer",
        decision: reviewForm.decision,
        comments: reviewForm.comments,
        reviewer_id: profile?.id,
      });
      toast({ title: t("customerEventDetail.reviewSubmitted"), description: t("customerEventDetail.decisionLabel", { decision: reviewForm.decision }) });
      setDialogOpen(false);
      setReviewForm({ decision: "approved", comments: "" });
      await loadData();
    } catch (err: any) {
      toast({ title: t("common.errorTitle"), description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-card-foreground/50 py-10 text-center">{t("customerEventDetail.loadingText")}</p>;
  if (!event) return <p className="text-sm text-destructive py-10 text-center">{t("customerEventDetail.eventNotFound")}</p>;

  const metadata = event.metadata || (typeof event.payload === "object" ? event.payload : null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/customer/events" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <SectionHeader title={t("customerEventDetail.title")} description={`${t("customerEventDetail.event")} ${event.id.slice(0, 8)}`} />
        <Badge variant="outline" className="ml-auto capitalize">{event.event_type}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard icon={MessageSquare} title={t("customerEventDetail.input")}>
          <p className="text-sm text-card-foreground whitespace-pre-wrap">
            {event.input_text || (typeof event.payload === "string" ? event.payload : t("customerEventDetail.noInput"))}
          </p>
        </ContentCard>
        <ContentCard icon={FileText} title={t("customerEventDetail.output")}>
          <p className="text-sm text-card-foreground whitespace-pre-wrap">
            {event.output_text || t("customerEventDetail.noOutput")}
          </p>
        </ContentCard>
      </div>

      {metadata && (
        <ContentCard icon={Code} title={t("customerEventDetail.metadata")}>
          <pre className="text-xs text-card-foreground/70 font-mono bg-secondary/30 rounded-lg p-4 overflow-x-auto">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </ContentCard>
      )}

      <ContentCard title={t("customerEventDetail.linkedReviews")}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-card-foreground/60">{t("customerEventDetail.reviews", { count: reviews.length })}</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" /> {t("customerEventDetail.createReview")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("customerEventDetail.createHumanReview")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>{t("customerEventDetail.decision")}</Label>
                  <Select value={reviewForm.decision} onValueChange={(v) => setReviewForm({ ...reviewForm, decision: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">{t("customerEventDetail.approved")}</SelectItem>
                      <SelectItem value="rejected">{t("customerEventDetail.rejected")}</SelectItem>
                      <SelectItem value="escalated">{t("customerEventDetail.escalated")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("customerEventDetail.notes")}</Label>
                  <Textarea
                    placeholder={t("customerEventDetail.reviewNotes")}
                    value={reviewForm.comments}
                    onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCreateReview} disabled={submitting}>
                    {submitting ? t("customerEventDetail.submitting") : t("customerEventDetail.submitReview")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable columns={reviewColumns} data={reviews} rowKey={(r) => r.id} emptyMessage={t("customerEventDetail.noReviews")} />
      </ContentCard>
    </div>
  );
}
