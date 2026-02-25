import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface TestEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestEventModal({ open, onOpenChange }: TestEventModalProps) {
  const [userMessage, setUserMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [metadata, setMetadata] = useState('{\n  "context": "customer_support"\n}');

  const handleSubmit = () => {
    fetch("http://localhost:4000/events/test", { method: "POST" }).catch(() => {});
    toast({ title: "Test event sent", description: "Your test event was submitted successfully." });
    setUserMessage("");
    setAiResponse("");
    setMetadata('{\n  "context": "customer_support"\n}');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Test Event</DialogTitle>
          <DialogDescription>Submit a test AI event to verify your integration.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>User Message</Label>
            <Textarea value={userMessage} onChange={(e) => setUserMessage(e.target.value)} placeholder="Enter user message..." className="bg-background/50 border-border" />
          </div>
          <div className="space-y-1.5">
            <Label>AI Response</Label>
            <Textarea value={aiResponse} onChange={(e) => setAiResponse(e.target.value)} placeholder="Enter AI response..." className="bg-background/50 border-border" />
          </div>
          <div className="space-y-1.5">
            <Label>Metadata (JSON)</Label>
            <Textarea value={metadata} onChange={(e) => setMetadata(e.target.value)} className="bg-background/50 border-border font-mono text-xs" rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Send Test Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
