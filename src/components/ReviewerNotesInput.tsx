import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Check } from "lucide-react";
import { submitReview } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface ReviewerNotesInputProps {
  violationId: string;
  onSubmit?: (notes: string) => void;
}

export function ReviewerNotesInput({ violationId, onSubmit }: ReviewerNotesInputProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [justSent, setJustSent] = useState(false);

  const handleSubmit = async () => {
    if (!notes.trim() || loading) return;
    setLoading(true);
    try {
      await submitReview({
        violation_id: violationId,
        reviewer_name: "Demo Reviewer",
        decision: "note",
        comments: notes,
      });
      toast({ title: "Note added", description: "Your note has been saved to the audit trail." });
      onSubmit?.(notes);
      setNotes("");
      setJustSent(true);
      setTimeout(() => setJustSent(false), 2000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Add a note to the audit trail…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={loading}
        className="bg-secondary/40 border-border/40 text-foreground placeholder:text-muted-foreground/50 resize-none rounded-lg text-sm focus:bg-secondary/60 transition-colors"
        rows={3}
      />
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-card-foreground/30">As Demo Reviewer</p>
        <Button
          onClick={handleSubmit}
          size="sm"
          disabled={loading || !notes.trim()}
          className="h-8 px-3.5 rounded-lg text-xs font-medium"
        >
          {loading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : justSent ? (
            <Check className="mr-1.5 h-3.5 w-3.5" />
          ) : (
            <Send className="mr-1.5 h-3.5 w-3.5" />
          )}
          {loading ? "Sending…" : justSent ? "Sent" : "Add Note"}
        </Button>
      </div>
    </div>
  );
}
