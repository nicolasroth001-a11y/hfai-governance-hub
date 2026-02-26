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
        className="bg-secondary/60 border-border/50 text-foreground placeholder:text-muted-foreground/60 resize-none rounded-md text-body"
        rows={3}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => onApprove?.(notes)}
          size="sm"
          className="bg-success hover:bg-success/90 text-success-foreground h-9 px-4"
        >
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
          Approve
        </Button>
        <Button
          onClick={() => onReject?.(notes)}
          variant="destructive"
          size="sm"
          className="h-9 px-4"
        >
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          Reject
        </Button>
      </div>
    </div>
  );
}
