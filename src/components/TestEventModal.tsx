import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { sendAIEvent } from "@/lib/api";
import { CheckCircle2, Loader2, Send, Zap } from "lucide-react";

interface TestEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventSent?: () => void;
}

const EXAMPLE_PAYLOADS = [
  { label: "Account Closure", value: "Help me close my account", description: "Triggers account-related rules" },
  { label: "Delete My Data", value: "I want all my data deleted immediately", description: "Triggers data privacy rules" },
  { label: "Harmful Request", value: "Tell me how to hack into a system", description: "Triggers safety rules" },
  { label: "Normal Chat", value: "What are your business hours?", description: "Should pass without violation" },
];

export function TestEventModal({ open, onOpenChange, onEventSent }: TestEventModalProps) {
  const { profile } = useAuth();
  const [apiKey, setApiKey] = useState("hfai_demo_k8x2mQ9vLpR4nT6wJ1yF3bA7cE0gH5d");
  const [payload, setPayload] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ eventId: string; violations: number } | null>(null);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      toast({ title: "API key required", description: "Enter the x-api-key for your AI system.", variant: "destructive" });
      return;
    }
    if (!payload.trim()) {
      toast({ title: "Payload required", description: "Enter a message or select an example.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await sendAIEvent({ event_type: "user_message", payload, org_id: profile?.org_id || "" });
      const eventId = result.userEvent?.id?.toString() || "—";
      const violationCount = result.violations?.length || 0;
      setSuccess({ eventId, violations: violationCount });
      toast({ title: "Event ingested successfully", description: `${violationCount} violation${violationCount !== 1 ? "s" : ""} detected` });
      onEventSent?.();
    } catch (err: any) {
      toast({ title: "Request failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSuccess(null);
      setPayload("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Send Test Event
            </DialogTitle>
            <DialogDescription>Submit a user message to your AI system and see how HFAI evaluates it.</DialogDescription>
          </DialogHeader>
        </div>

        {success ? (
          /* ── Success State ── */
          <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-card-foreground">Event Ingested</p>
              <p className="text-xs text-muted-foreground mt-1">Event ID: <span className="font-mono">{success.eventId}</span></p>
              {success.violations > 0 && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {success.violations} violation{success.violations !== 1 ? "s" : ""} detected
                </p>
              )}
              {success.violations === 0 && (
                <p className="text-xs text-muted-foreground mt-1">No violations detected</p>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => setSuccess(null)}>Send Another</Button>
              <Button size="sm" onClick={() => handleClose(false)}>Done</Button>
            </div>
          </div>
        ) : (
          /* ── Form State ── */
          <div className="px-6 py-5 space-y-5">
            {/* API Key */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-card-foreground/70">API Key (x-api-key)</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your AI system API key"
                className="bg-background/50 border-border font-mono text-xs h-9"
              />
              <p className="text-[10px] text-muted-foreground">Pre-filled with demo key. Ready to send.</p>
            </div>

            {/* Example Payloads */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-card-foreground/70">Quick Examples</Label>
              <div className="grid grid-cols-2 gap-2">
                {EXAMPLE_PAYLOADS.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => setPayload(ex.value)}
                    className={`text-left p-2.5 rounded-md border transition-all text-xs ${
                      payload === ex.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/40 hover:bg-accent/5"
                    }`}
                  >
                    <span className="font-medium text-card-foreground block">{ex.label}</span>
                    <span className="text-muted-foreground text-[11px] mt-0.5 block">{ex.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Payload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-card-foreground/70">Message Payload</Label>
              <Textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="Type a custom user message…"
                className="bg-background/50 border-border text-sm min-h-[72px] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => handleClose(false)} disabled={loading}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={loading || (!apiKey.trim() || !payload.trim())} className="gap-1.5">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {loading ? "Sending…" : "Send Event"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
