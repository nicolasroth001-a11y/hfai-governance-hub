import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { fetchViolation, updateViolation } from "@/lib/api";
import { ViolationSummaryCard } from "@/components/ViolationSummaryCard";
import { AISystemInfoCard } from "@/components/AISystemInfoCard";
import { EventPayloadCard } from "@/components/EventPayloadCard";
import { AuditTrailCard } from "@/components/AuditTrailCard";
import { ReviewActions } from "@/components/ReviewActions";
import { ReviewerNotesInput } from "@/components/ReviewerNotesInput";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Gavel, StickyNote } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CustomerViolationDetail() {
  const { id } = useParams();
  const [v, setV] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [auditKey, setAuditKey] = useState(0);

  useEffect(() => {
    if (id) {
      fetchViolation(id)
        .then((data) => {
          setV(data);
          setStatus(data.status || "open");
          setResolutionNotes((data as any).resolution_notes || "");
        })
        .catch((err) => setError(err.message || "Failed to load violation"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const refreshAudit = useCallback(() => setAuditKey((k) => k + 1), []);

  const handleSaveResolution = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await updateViolation(id, { status, resolution_notes: resolutionNotes });
      setV(updated);
      toast({ title: "Updated", description: `Violation status set to "${status}"` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDecision = useCallback((decision: "approve" | "reject") => {
    setStatus("resolved");
    refreshAudit();
  }, [refreshAudit]);

  if (loading) return <p className="text-sm text-card-foreground/50 py-10 text-center">Loading…</p>;
  if (error || !v) return (
    <div className="text-center py-20 text-muted-foreground">
      {error || "Violation not found."}{" "}
      <Link to="/customer/violations" className="text-primary hover:underline">Back to violations</Link>
    </div>
  );

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/customer/violations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Violations
        </Link>
        <SectionHeader title={`Violation #${typeof v.id === "string" ? v.id.slice(0, 8) : v.id}`} description="Review violation details and resolve" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-base">
        <ViolationSummaryCard
          id={v.id}
          description={v.description}
          severity={v.severity}
          rule_id={v.rule_id}
          detected_at={v.detected_at}
          status={v.status || "open"}
        />
        <AISystemInfoCard aiSystemId={v.ai_system_id} />
      </div>

      <EventPayloadCard data={v} />

      {/* Resolution Workflow */}
      <ContentCard title="Resolution Workflow">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Resolution Notes</Label>
            <Textarea
              placeholder="Describe how this violation was investigated and resolved…"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={4}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={handleSaveResolution} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Update Status"}
            </Button>
          </div>
        </div>
      </ContentCard>

      {/* Customer QA Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-base">
        <ContentCard icon={Gavel} title="Internal QA Review">
          <ReviewActions violationId={String(v.id)} onDecision={handleDecision} />
        </ContentCard>
        <ContentCard icon={StickyNote} title="QA Notes">
          <ReviewerNotesInput violationId={String(v.id)} onSubmit={refreshAudit} />
        </ContentCard>
      </div>

      <AuditTrailCard key={auditKey} violationId={v.id} />
    </div>
  );
}