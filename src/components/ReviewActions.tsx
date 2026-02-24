import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReviewActionsProps {
  violationId: string;
  onReview?: (action: "approve" | "reject", notes: string) => void;
}

export function ReviewActions({ violationId, onReview }: ReviewActionsProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    try {
      onReview?.(action, notes);
      toast({
        title: action === "approve" ? "Violation Approved" : "Violation Rejected",
        description: `${violationId} has been ${action === "approve" ? "approved" : "rejected"}.`,
      });
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
        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
        rows={3}
      />
      <div className="flex gap-3">
        <Button
          onClick={() => handleAction("approve")}
          disabled={loading}
          className="bg-success hover:bg-success/90 text-success-foreground"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve
        </Button>
        <Button
          onClick={() => handleAction("reject")}
          disabled={loading}
          variant="destructive"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}
