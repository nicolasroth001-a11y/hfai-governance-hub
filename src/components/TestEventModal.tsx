import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { sendAIEvent } from "@/lib/api";

interface TestEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestEventModal({ open, onOpenChange }: TestEventModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [payload, setPayload] = useState("Help me close my account");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      toast({ title: "API key required", description: "Enter the x-api-key for your AI system.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await sendAIEvent({ event_type: "user_message", payload }, apiKey);
      toast({ title: "Test event sent", description: `Event ID: ${result.userEvent?.id || "unknown"}` });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Test Event</DialogTitle>
          <DialogDescription>Submit a test AI event via POST /ai-events.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>API Key (x-api-key)</Label>
            <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your AI system API key" className="bg-background/50 border-border font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label>Payload (user message)</Label>
            <Textarea value={payload} onChange={(e) => setPayload(e.target.value)} placeholder="Enter user message..." className="bg-background/50 border-border" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Sending…" : "Send Test Event"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
