import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { fetchViolation, updateViolation } from "@/lib/api";
import { ViolationSummaryCard } from "@/components/ViolationSummaryCard";
import { AISystemInfoCard } from "@/components/AISystemInfoCard";
import { EventPayloadCard } from "@/components/EventPayloadCard";
import { AuditTrailCard } from "@/components/AuditTrailCard";
import { ReviewActions } from "@/components/ReviewActions";
import { ReviewerNotesInput } from "@/components/ReviewerNotesInput";
import { RCASection } from "@/components/RCASection";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Gavel, StickyNote } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CustomerViolationDetail() {
  const { t } = useTranslation();
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
      toast({ title: t("customerViolationDetail.updated"), description: t("customerViolationDetail.updatedDesc", { status }) });
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

  if (loading) return <p className="text-sm text-card-foreground/50 py-10 text-center">{t("customerViolationDetail.loading")}</p>;
  if (error || !v) return (
    <div className="text-center py-20 text-muted-foreground">
      {error || t("customerViolationDetail.notFound")}{" "}
      <Link to="/customer/violations" className="text-primary hover:underline">{t("customerViolationDetail.backLink")}</Link>
    </div>
  );

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/customer/violations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("customerViolationDetail.backToViolations")}
        </Link>
        <SectionHeader title={t("customerViolationDetail.title", { id: typeof v.id === "string" ? v.id.slice(0, 8) : v.id })} description={t("customerViolationDetail.description")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-base">
        <ViolationSummaryCard id={v.id} description={v.description} severity={v.severity} rule_id={v.rule_id} detected_at={v.detected_at} status={v.status || "open"} />
        <AISystemInfoCard aiSystemId={v.ai_system_id} />
      </div>

      <EventPayloadCard data={v} />

      <ContentCard title={t("customerViolationDetail.resolutionWorkflow")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("customerViolationDetail.status")}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">{t("customerViolationDetail.open")}</SelectItem>
                <SelectItem value="investigating">{t("customerViolationDetail.investigating")}</SelectItem>
                <SelectItem value="resolved">{t("customerViolationDetail.resolved")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("customerViolationDetail.resolutionNotes")}</Label>
            <Textarea placeholder={t("customerViolationDetail.resolutionNotesPlaceholder")} value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} rows={4} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={handleSaveResolution} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? t("customerViolationDetail.saving") : t("customerViolationDetail.updateStatus")}
            </Button>
          </div>
        </div>
      </ContentCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-base">
        <ContentCard icon={Gavel} title={t("customerViolationDetail.internalQA")}>
          <ReviewActions violationId={String(v.id)} onDecision={handleDecision} />
        </ContentCard>
        <ContentCard icon={StickyNote} title={t("customerViolationDetail.qaNotes")}>
          <ReviewerNotesInput violationId={String(v.id)} onSubmit={refreshAudit} />
        </ContentCard>
      </div>

      <RCASection violationId={String(v.id)} canEdit />
      <AuditTrailCard key={auditKey} violationId={v.id} />
    </div>
  );
}
