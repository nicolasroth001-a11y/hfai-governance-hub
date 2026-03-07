import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { submitReview } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReviewActionsProps {
  violationId: string;
  onDecision?: (decision: "approve" | "reject", notes: string) => void;
}

export function ReviewActions({ violationId, onDecision }: ReviewActionsProps) {
  const { profile } = useAuth();
  const reviewerName = profile?.name || profile?.email || "Unknown Reviewer";
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(null);
  const [submitted, setSubmitted] = useState<"approve" | "reject" | null>(null);

  const handleAction = async (decision: "approve" | "reject") => {
    if (submitting || submitted) return;
    setSubmitting(decision);
    try {
      await submitReview({
        violation_id: violationId,
        reviewer_name: reviewerName,
        reviewer_id: profile?.id,
        decision,
        comments: notes,
      });
      setSubmitted(decision);
      toast({
        title: decision === "approve" ? "✓ Violation Approved" : "✗ Violation Rejected",
        description: `Violation #${violationId.slice(0, 8)} has been ${decision === "approve" ? "approved" : "rejected"}.`,
      });
      onDecision?.(decision, notes);
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(null);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-3 animate-fade-in">
        <div className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center",
          submitted === "approve"
            ? "bg-success/15 text-success"
            : "bg-destructive/15 text-destructive"
        )}>
          {submitted === "approve"
            ? <ShieldCheck className="h-6 w-6" />
            : <XCircle className="h-6 w-6" />
          }
        </div>
        <p className="text-sm font-medium text-card-foreground">
          {submitted === "approve" ? "Approved" : "Rejected"}
        </p>
        <p className="text-xs text-card-foreground/50">Decision recorded by {reviewerName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Add review notes (optional)…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={!!submitting}
        className="bg-secondary/40 border-border/40 text-foreground placeholder:text-muted-foreground/50 resize-none rounded-lg text-sm focus:bg-secondary/60 transition-colors"
        rows={3}
      />

      <div className="flex gap-2.5">
        <Button
          onClick={() => handleAction("approve")}
          disabled={!!submitting}
          className={cn(
            "flex-1 h-10 rounded-lg font-medium text-sm transition-all duration-200",
            "bg-success hover:bg-success/90 text-success-foreground shadow-sm hover:shadow-md"
          )}
        >
          {submitting === "approve" ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-1.5 h-4 w-4" />
          )}
          {submitting === "approve" ? "Approving…" : "Approve"}
        </Button>

        <Button
          onClick={() => handleAction("reject")}
          disabled={!!submitting}
          className={cn(
            "flex-1 h-10 rounded-lg font-medium text-sm transition-all duration-200",
            "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm hover:shadow-md"
          )}
        >
          {submitting === "reject" ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="mr-1.5 h-4 w-4" />
          )}
          {submitting === "reject" ? "Rejecting…" : "Reject"}
        </Button>
      </div>

      <p className="text-[11px] text-card-foreground/30 text-center">
        Submitting as {reviewerName}
      </p>
    </div>
  );
}