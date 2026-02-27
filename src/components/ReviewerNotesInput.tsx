import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { submitReview } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface ReviewerNotesInputProps {
  violationId: string;
  onSubmit?: (notes: string) => void;
}

export function ReviewerNotesInput({ violationId, onSubmit }: ReviewerNotesInputProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    try {
      await submitReview({
        violation_id: violationId,
        reviewer_name: "Current Reviewer",
        decision: "approve",
        comments: notes,
      });
      toast({ title: "Note added", description: "Your note has been saved." });
      onSubmit?.(notes);
      setNotes("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Add reviewer notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="bg-secondary/60 border-border/50 text-foreground placeholder:text-muted-foreground/60 resize-none rounded-md text-body"
        rows={4}
      />
      <Button onClick={handleSubmit} size="sm" className="h-9 px-4" disabled={loading}>
        <Send className="mr-1.5 h-3.5 w-3.5" />
        Add Note
      </Button>
    </div>
  );
}
