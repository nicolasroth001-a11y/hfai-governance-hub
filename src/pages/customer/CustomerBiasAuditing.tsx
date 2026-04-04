import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import {
  Scale,
  Plus,
  CheckCircle2,
  XCircle,
  BarChart3,
  AlertTriangle,
  Loader2,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AISystem {
  id: string;
  name: string;
  risk_level: string;
}

interface BiasAudit {
  id: string;
  ai_system_id: string;
  metric_type: string;
  score: number | null;
  threshold: number | null;
  passed: boolean;
  dataset_description: string;
  notes: string;
  status: string;
  created_at: string;
}

const METRIC_TYPES = [
  { value: "demographic_parity", label: "Demographic Parity", description: "Equal prediction rates across groups" },
  { value: "equalized_odds", label: "Equalized Odds", description: "Equal TPR and FPR across groups" },
  { value: "disparate_impact", label: "Disparate Impact Ratio", description: "Selection rate ratio ≥ 0.8 (80% rule)" },
  { value: "predictive_parity", label: "Predictive Parity", description: "Equal PPV across groups" },
  { value: "calibration", label: "Calibration", description: "Predicted probabilities match actual outcomes" },
];

export default function CustomerBiasAuditing() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [audits, setAudits] = useState<BiasAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ai_system_id: "",
    metric_type: "demographic_parity",
    score: "",
    threshold: "0.8",
    dataset_description: "",
    notes: "",
  });

  const orgId = profile?.org_id;

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [sysRes, auditRes] = await Promise.all([
        supabase.from("ai_systems").select("id, name, risk_level").eq("org_id", orgId),
        supabase.from("bias_fairness_audits").select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
      ]);
      setSystems((sysRes.data as AISystem[]) || []);
      setAudits((auditRes.data as BiasAudit[]) || []);
    } catch {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async () => {
    if (!orgId || !form.ai_system_id) {
      toast({ title: "Missing fields", description: "Select an AI system", variant: "destructive" });
      return;
    }
    setSaving(true);
    const score = form.score ? parseFloat(form.score) : null;
    const threshold = form.threshold ? parseFloat(form.threshold) : 0.8;
    const passed = score !== null && score >= threshold;

    const { error } = await supabase.from("bias_fairness_audits").insert({
      ai_system_id: form.ai_system_id,
      org_id: orgId,
      metric_type: form.metric_type,
      score,
      threshold,
      passed,
      dataset_description: form.dataset_description,
      notes: form.notes,
      status: score !== null ? "completed" : "pending",
    } as any);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Audit recorded", description: `Fairness metric ${passed ? "passed ✓" : "failed ✗"}` });
      setShowForm(false);
      setForm({ ai_system_id: "", metric_type: "demographic_parity", score: "", threshold: "0.8", dataset_description: "", notes: "" });
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("bias_fairness_audits").delete().eq("id", id);
    if (!error) { loadData(); toast({ title: "Deleted" }); }
  };

  const filtered = selectedSystem === "all" ? audits : audits.filter((a) => a.ai_system_id === selectedSystem);
  const passRate = filtered.length ? Math.round((filtered.filter((a) => a.passed).length / filtered.length) * 100) : 0;
  const pendingCount = filtered.filter((a) => a.status === "pending").length;
  const failedCount = filtered.filter((a) => !a.passed && a.status === "completed").length;

  return (
    <SubscriptionGate feature="Bias & Fairness Auditing">
      <div className="space-y-6">
        <SectionHeader title={t("customerBiasAuditing.title")} description={t("customerBiasAuditing.description")} />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">{t("customerBiasAuditing.totalAudits")}</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">{filtered.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Pass Rate</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">{passRate}%</p>
            <Progress value={passRate} className="mt-2 h-1.5" />
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Pending</p>
            <p className="text-2xl font-bold text-warning mt-1">{pendingCount}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Failed</p>
            <p className="text-2xl font-bold text-destructive mt-1">{failedCount}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedSystem} onValueChange={setSelectedSystem}>
            <SelectTrigger className="w-[200px] bg-card border-card-foreground/10">
              <SelectValue placeholder="Filter by system" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Systems</SelectItem>
              {systems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Record Audit
          </Button>
        </div>

        {/* New Audit Form */}
        {showForm && (
          <ContentCard icon={BarChart3} title="Record Fairness Audit">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">AI System</Label>
                <Select value={form.ai_system_id} onValueChange={(v) => setForm({ ...form, ai_system_id: v })}>
                  <SelectTrigger className="bg-card border-card-foreground/10"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {systems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Metric Type</Label>
                <Select value={form.metric_type} onValueChange={(v) => setForm({ ...form, metric_type: v })}>
                  <SelectTrigger className="bg-card border-card-foreground/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METRIC_TYPES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Score (0–1)</Label>
                <Input type="number" step="0.01" min="0" max="1" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} className="bg-card border-card-foreground/10" placeholder="e.g. 0.85" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Threshold</Label>
                <Input type="number" step="0.01" min="0" max="1" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} className="bg-card border-card-foreground/10" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-xs text-card-foreground/60">Dataset Description</Label>
                <Textarea value={form.dataset_description} onChange={(e) => setForm({ ...form, dataset_description: e.target.value })} className="bg-card border-card-foreground/10" placeholder="Describe the evaluation dataset…" rows={2} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-xs text-card-foreground/60">Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-card border-card-foreground/10" placeholder="Additional observations…" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                  Save Audit
                </Button>
              </div>
            </div>
          </ContentCard>
        )}

        {/* Audit List */}
        {loading ? (
          <p className="text-sm text-card-foreground/50 text-center py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <ContentCard icon={Scale} title="No Audits Yet">
            <p className="text-sm text-card-foreground/50">Record your first bias/fairness audit to start tracking Art. 10 compliance.</p>
          </ContentCard>
        ) : (
          <div className="space-y-3">
            {filtered.map((audit) => {
              const system = systems.find((s) => s.id === audit.ai_system_id);
              const metric = METRIC_TYPES.find((m) => m.value === audit.metric_type);
              return (
                <div key={audit.id} className="bg-card rounded-xl border border-card-foreground/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {audit.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      ) : audit.status === "pending" ? (
                        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{metric?.label || audit.metric_type}</p>
                        <p className="text-xs text-card-foreground/50">{system?.name || "Unknown"} · {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {audit.score !== null && (
                        <Badge variant={audit.passed ? "default" : "destructive"} className="font-mono text-xs">
                          {audit.score.toFixed(2)} / {audit.threshold?.toFixed(2)}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {audit.status}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(audit.id)} className="h-7 w-7 p-0 text-card-foreground/30 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {(audit.dataset_description || audit.notes) && (
                    <div className="mt-2 pl-8 space-y-1">
                      {audit.dataset_description && <p className="text-xs text-card-foreground/40">{audit.dataset_description}</p>}
                      {audit.notes && <p className="text-xs text-card-foreground/40 italic">{audit.notes}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SubscriptionGate>
  );
}
