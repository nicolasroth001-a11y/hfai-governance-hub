import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReviewerPermissions, fetchReviewerOverrides, createReviewerOverride } from "@/hooks/useReviewerPermissions";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface OverrideActionProps {
  violationId: string;
  orgId: string;
  latestReview: { id: string; decision: string; reviewer_name: string } | null;
  onOverride?: () => void;
}

export function OverrideAction({ violationId, orgId, latestReview, onOverride }: OverrideActionProps) {
  const { profile } = useAuth();
  const { can, isHFAI } = useReviewerPermissions();
  const [showForm, setShowForm] = useState(false);
  const [decision, setDecision] = useState("rejected");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!can("can_override_decisions") || !isHFAI || !latestReview) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({ title: "Justification required", description: "You must provide a reason for the override.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createReviewerOverride({
        org_id: orgId,
        violation_id: violationId,
        original_review_id: latestReview.id,
        override_reviewer_id: profile!.id,
        original_decision: latestReview.decision,
        override_decision: decision,
        override_reason: reason,
      });
      toast({ title: "Decision overridden", description: "Override has been recorded in the audit trail." });
      setShowForm(false);
      setReason("");
      onOverride?.();
    } catch (err: any) {
      toast({ title: "Override failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {!showForm ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
          onClick={() => setShowForm(true)}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Override Decision
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-500">HFAI Override</span>
          </div>

          <p className="text-xs text-muted-foreground">
            Overriding <strong>{latestReview.reviewer_name || "company reviewer"}</strong>'s decision of <Badge variant="secondary" className="text-xs">{latestReview.decision}</Badge>
          </p>

          <div className="space-y-2">
            <Label className="text-xs">New Decision</Label>
            <Select value={decision} onValueChange={setDecision}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Justification (Required)</Label>
            <Textarea
              placeholder="Explain why this decision is being overridden..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Confirm Override"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function OverrideHistory({ violationId }: { violationId: string }) {
  const [overrides, setOverrides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewerOverrides(violationId)
      .then(setOverrides)
      .finally(() => setLoading(false));
  }, [violationId]);

  if (loading || overrides.length === 0) return null;

  return (
    <ContentCard icon={History} title="Override History">
      <div className="space-y-3">
        {overrides.map((o: any) => (
          <div key={o.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-500">HFAI Override</span>
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="text-[10px]">{o.original_decision}</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant={o.override_decision === "approved" ? "default" : "destructive"} className="text-[10px]">
                {o.override_decision}
              </Badge>
            </div>
            {o.override_reason && (
              <p className="text-xs text-muted-foreground">{o.override_reason}</p>
            )}
          </div>
        ))}
      </div>
    </ContentCard>
  );
}
