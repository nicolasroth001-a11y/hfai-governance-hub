import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Pause,
  Play,
  Trash2,
  Loader2,
  Clock,
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";

interface AISystem { id: string; name: string; }

interface ScheduledAudit {
  id: string;
  ai_system_id: string;
  audit_type: string;
  frequency_days: number;
  next_due_at: string;
  last_completed_at: string | null;
  status: string;
  notes: string;
  created_at: string;
}

const AUDIT_TYPES = [
  { value: "governance_review", label: "Governance Review" },
  { value: "bias_check", label: "Bias/Fairness Check" },
  { value: "compliance_review", label: "Compliance Review" },
  { value: "risk_assessment", label: "Risk Assessment" },
  { value: "data_quality", label: "Data Quality Audit" },
];

export default function CustomerScheduledAudits() {
  const { profile } = useAuth();
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [audits, setAudits] = useState<ScheduledAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ai_system_id: "",
    audit_type: "governance_review",
    frequency_days: "90",
    notes: "",
  });
  const orgId = profile?.org_id;

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const [sysRes, auditRes] = await Promise.all([
      supabase.from("ai_systems").select("id, name").eq("org_id", orgId),
      supabase.from("scheduled_audits").select("*").eq("org_id", orgId).order("next_due_at", { ascending: true }),
    ]);
    setSystems((sysRes.data as AISystem[]) || []);
    setAudits((auditRes.data as ScheduledAudit[]) || []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!orgId || !form.ai_system_id) {
      toast({ title: "Select an AI system", variant: "destructive" });
      return;
    }
    setSaving(true);
    const days = parseInt(form.frequency_days) || 90;
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + days);

    const { error } = await supabase.from("scheduled_audits").insert({
      ai_system_id: form.ai_system_id,
      org_id: orgId,
      audit_type: form.audit_type,
      frequency_days: days,
      next_due_at: nextDue.toISOString(),
      notes: form.notes,
    } as any);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Audit scheduled" });
      setShowForm(false);
      setForm({ ai_system_id: "", audit_type: "governance_review", frequency_days: "90", notes: "" });
      loadData();
    }
  };

  const handleToggleStatus = async (audit: ScheduledAudit) => {
    const newStatus = audit.status === "active" ? "paused" : "active";
    await supabase.from("scheduled_audits").update({ status: newStatus } as any).eq("id", audit.id);
    loadData();
  };

  const handleComplete = async (audit: ScheduledAudit) => {
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + audit.frequency_days);
    await supabase.from("scheduled_audits").update({
      last_completed_at: new Date().toISOString(),
      next_due_at: nextDue.toISOString(),
    } as any).eq("id", audit.id);
    toast({ title: "Audit marked complete", description: `Next due ${format(nextDue, "MMM d, yyyy")}` });
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("scheduled_audits").delete().eq("id", id);
    loadData();
  };

  const overdueCount = audits.filter((a) => a.status === "active" && isPast(new Date(a.next_due_at))).length;

  return (
    <SubscriptionGate feature="Scheduled Audits">
      <div className="space-y-6">
        <SectionHeader title="Scheduled Recurring Audits" description="Set periodic governance reviews per AI system with automated tracking" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Active Schedules</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">{audits.filter((a) => a.status === "active").length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Overdue</p>
            <p className={`text-2xl font-bold mt-1 ${overdueCount > 0 ? "text-destructive" : "text-card-foreground"}`}>{overdueCount}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Paused</p>
            <p className="text-2xl font-bold text-card-foreground/50 mt-1">{audits.filter((a) => a.status === "paused").length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Systems Covered</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">{new Set(audits.map((a) => a.ai_system_id)).size}</p>
          </div>
        </div>

        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Schedule Audit
        </Button>

        {showForm && (
          <ContentCard icon={CalendarClock} title="New Scheduled Audit">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">AI System</Label>
                <Select value={form.ai_system_id} onValueChange={(v) => setForm({ ...form, ai_system_id: v })}>
                  <SelectTrigger className="bg-card border-card-foreground/10"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{systems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Audit Type</Label>
                <Select value={form.audit_type} onValueChange={(v) => setForm({ ...form, audit_type: v })}>
                  <SelectTrigger className="bg-card border-card-foreground/10"><SelectValue /></SelectTrigger>
                  <SelectContent>{AUDIT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Frequency (days)</Label>
                <Input type="number" min="7" value={form.frequency_days} onChange={(e) => setForm({ ...form, frequency_days: e.target.value })} className="bg-card border-card-foreground/10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-card border-card-foreground/10" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CalendarClock className="h-4 w-4 mr-1" />}
                  Schedule
                </Button>
              </div>
            </div>
          </ContentCard>
        )}

        {loading ? (
          <p className="text-sm text-card-foreground/50 text-center py-8">Loading…</p>
        ) : audits.length === 0 ? (
          <ContentCard icon={CalendarClock} title="No Scheduled Audits">
            <p className="text-sm text-card-foreground/50">Schedule recurring governance reviews to maintain continuous compliance.</p>
          </ContentCard>
        ) : (
          <div className="space-y-3">
            {audits.map((audit) => {
              const system = systems.find((s) => s.id === audit.ai_system_id);
              const overdue = audit.status === "active" && isPast(new Date(audit.next_due_at));
              const auditType = AUDIT_TYPES.find((t) => t.value === audit.audit_type);
              return (
                <div key={audit.id} className={`bg-card rounded-xl border p-4 ${overdue ? "border-destructive/30" : "border-card-foreground/5"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {overdue ? (
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                      ) : (
                        <Clock className="h-5 w-5 text-primary shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{auditType?.label || audit.audit_type}</p>
                        <p className="text-xs text-card-foreground/50">{system?.name || "Unknown"} · Every {audit.frequency_days} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={overdue ? "destructive" : audit.status === "paused" ? "outline" : "default"} className="text-xs">
                        {overdue ? "Overdue" : audit.status}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleComplete(audit)} className="h-7 w-7 p-0" title="Mark complete">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(audit)} className="h-7 w-7 p-0" title={audit.status === "active" ? "Pause" : "Resume"}>
                        {audit.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(audit.id)} className="h-7 w-7 p-0 text-card-foreground/30 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 pl-8 flex items-center gap-4 text-xs text-card-foreground/40">
                    <span>Due: {format(new Date(audit.next_due_at), "MMM d, yyyy")}</span>
                    {audit.last_completed_at && (
                      <span>Last: {formatDistanceToNow(new Date(audit.last_completed_at), { addSuffix: true })}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SubscriptionGate>
  );
}
