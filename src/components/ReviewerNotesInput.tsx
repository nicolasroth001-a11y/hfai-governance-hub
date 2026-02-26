import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ReviewerNotesInputProps {
  violationId: string;
  onSubmit?: (notes: string) => void;
}

export function ReviewerNotesInput({ violationId, onSubmit }: ReviewerNotesInputProps) {
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (notes.trim()) {
      onSubmit?.(notes);
      setNotes("");
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
      <Button onClick={handleSubmit} size="sm" className="h-9 px-4">
        <Send className="mr-1.5 h-3.5 w-3.5" />
        Add Note
      </Button>
    </div>
  );
}
