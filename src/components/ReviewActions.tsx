import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";
import { submitReview } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface ReviewActionsProps {
  violationId: string;
  onApprove?: (notes: string) => void;
  onReject?: (notes: string) => void;
}

export function ReviewActions({ violationId, onApprove, onReject }: ReviewActionsProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (decision: "approve" | "reject") => {
    setLoading(true);
    try {
      await submitReview({
        violation_id: violationId,
        reviewer_name: "Current Reviewer",
        decision,
        comments: notes,
      });
      toast({ title: decision === "approve" ? "Approved" : "Rejected", description: `Violation ${violationId} has been ${decision}d.` });
      if (decision === "approve") onApprove?.(notes);
      else onReject?.(notes);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Add review notes (optional)..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="bg-secondary/60 border-border/50 text-foreground placeholder:text-muted-foreground/60 resize-none rounded-md text-body"
        rows={3}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => handleAction("approve")}
          size="sm"
          className="bg-success hover:bg-success/90 text-success-foreground h-9 px-4"
          disabled={loading}
        >
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
          Approve
        </Button>
        <Button
          onClick={() => handleAction("reject")}
          variant="destructive"
          size="sm"
          className="h-9 px-4"
          disabled={loading}
        >
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          Reject
        </Button>
      </div>
    </div>
  );
}
