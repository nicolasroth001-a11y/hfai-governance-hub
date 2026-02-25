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
        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
        rows={4}
      />
      <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
        <Send className="mr-2 h-4 w-4" />
        Add Note
      </Button>
    </div>
  );
}
