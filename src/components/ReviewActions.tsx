import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";

interface ReviewActionsProps {
  violationId: string;
  onApprove?: (notes: string) => void;
  onReject?: (notes: string) => void;
}

export function ReviewActions({ violationId, onApprove, onReject }: ReviewActionsProps) {
  const [notes, setNotes] = useState("");

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
          onClick={() => onApprove?.(notes)}
          className="bg-success hover:bg-success/90 text-success-foreground"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve
        </Button>
        <Button
          onClick={() => onReject?.(notes)}
          variant="destructive"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}
