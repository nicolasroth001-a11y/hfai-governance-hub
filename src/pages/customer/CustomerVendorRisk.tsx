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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import {
  Building2,
  Plus,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface AISystem { id: string; name: string; }

interface VendorAssessment {
  id: string;
  ai_system_id: string | null;
  vendor_name: string;
  vendor_contact: string;
  risk_score: number;
  assessment_date: string;
  contract_terms: string;
  data_processing_agreement: boolean;
  security_review_passed: boolean;
  compliance_status: string;
  notes: string;
  status: string;
  created_at: string;
}

const RISK_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Very Low", color: "text-emerald-500" },
  2: { label: "Low", color: "text-emerald-400" },
  3: { label: "Medium", color: "text-warning" },
  4: { label: "High", color: "text-orange-500" },
  5: { label: "Critical", color: "text-destructive" },
};

export default function CustomerVendorRisk() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [assessments, setAssessments] = useState<VendorAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vendor_name: "",
    vendor_contact: "",
    ai_system_id: "",
    risk_score: "3",
    contract_terms: "",
    data_processing_agreement: false,
    security_review_passed: false,
    notes: "",
  });
  const orgId = profile?.org_id;

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const [sysRes, vendorRes] = await Promise.all([
      supabase.from("ai_systems").select("id, name").eq("org_id", orgId),
      supabase.from("vendor_risk_assessments").select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
    ]);
    setSystems((sysRes.data as AISystem[]) || []);
    setAssessments((vendorRes.data as VendorAssessment[]) || []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!orgId || !form.vendor_name) {
      toast({ title: "Vendor name required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("vendor_risk_assessments").insert({
      org_id: orgId,
      ai_system_id: form.ai_system_id || null,
      vendor_name: form.vendor_name,
      vendor_contact: form.vendor_contact,
      risk_score: parseInt(form.risk_score),
      contract_terms: form.contract_terms,
      data_processing_agreement: form.data_processing_agreement,
      security_review_passed: form.security_review_passed,
      notes: form.notes,
      status: "draft",
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vendor assessment created" });
      setShowForm(false);
      setForm({ vendor_name: "", vendor_contact: "", ai_system_id: "", risk_score: "3", contract_terms: "", data_processing_agreement: false, security_review_passed: false, notes: "" });
      loadData();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from("vendor_risk_assessments").update({ status: newStatus } as any).eq("id", id);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("vendor_risk_assessments").delete().eq("id", id);
    loadData();
  };

  const avgRisk = assessments.length ? (assessments.reduce((s, a) => s + a.risk_score, 0) / assessments.length).toFixed(1) : "—";

  return (
    <SubscriptionGate feature="Vendor Risk Assessment">
      <div className="space-y-6">
        <SectionHeader title="Third-Party Vendor Risk" description="Assess and track AI supply chain risks — EU AI Act Art. 25 compliance" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Vendors Assessed</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">{assessments.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Avg Risk Score</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">{avgRisk}/5</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">DPA Signed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{assessments.filter((a) => a.data_processing_agreement).length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Security Passed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{assessments.filter((a) => a.security_review_passed).length}</p>
          </div>
        </div>

        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Assessment
        </Button>

        {showForm && (
          <ContentCard icon={Building2} title="New Vendor Assessment">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Vendor Name *</Label>
                <Input value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} className="bg-card border-card-foreground/10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Vendor Contact</Label>
                <Input value={form.vendor_contact} onChange={(e) => setForm({ ...form, vendor_contact: e.target.value })} className="bg-card border-card-foreground/10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Linked AI System</Label>
                <Select value={form.ai_system_id} onValueChange={(v) => setForm({ ...form, ai_system_id: v })}>
                  <SelectTrigger className="bg-card border-card-foreground/10"><SelectValue placeholder="Optional…" /></SelectTrigger>
                  <SelectContent>{systems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Risk Score (1–5)</Label>
                <Select value={form.risk_score} onValueChange={(v) => setForm({ ...form, risk_score: v })}>
                  <SelectTrigger className="bg-card border-card-foreground/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n} — {RISK_LABELS[n].label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-xs text-card-foreground/60">Contract Terms</Label>
                <Textarea value={form.contract_terms} onChange={(e) => setForm({ ...form, contract_terms: e.target.value })} className="bg-card border-card-foreground/10" rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.data_processing_agreement} onCheckedChange={(c) => setForm({ ...form, data_processing_agreement: !!c })} />
                <Label className="text-xs text-card-foreground/60">DPA Signed</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.security_review_passed} onCheckedChange={(c) => setForm({ ...form, security_review_passed: !!c })} />
                <Label className="text-xs text-card-foreground/60">Security Review Passed</Label>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-xs text-card-foreground/60">Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-card border-card-foreground/10" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Shield className="h-4 w-4 mr-1" />}
                  Save Assessment
                </Button>
              </div>
            </div>
          </ContentCard>
        )}

        {loading ? (
          <p className="text-sm text-card-foreground/50 text-center py-8">Loading…</p>
        ) : assessments.length === 0 ? (
          <ContentCard icon={Building2} title="No Vendor Assessments">
            <p className="text-sm text-card-foreground/50">Add third-party AI vendor assessments to track supply chain governance.</p>
          </ContentCard>
        ) : (
          <div className="space-y-3">
            {assessments.map((a) => {
              const riskInfo = RISK_LABELS[a.risk_score] || RISK_LABELS[3];
              const system = systems.find((s) => s.id === a.ai_system_id);
              return (
                <div key={a.id} className="bg-card rounded-xl border border-card-foreground/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{a.vendor_name}</p>
                      <p className="text-xs text-card-foreground/50">
                        {system ? `Linked: ${system.name}` : "No linked system"} · {format(new Date(a.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${riskInfo.color}`}>Risk: {a.risk_score}/5</span>
                      <Select value={a.status} onValueChange={(v) => handleStatusChange(a.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-[100px] bg-card border-card-foreground/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in_review">In Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="h-7 w-7 p-0 text-card-foreground/30 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    {a.data_processing_agreement ? (
                      <Badge variant="default" className="text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> DPA</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs gap-1 text-card-foreground/40"><XCircle className="h-3 w-3" /> No DPA</Badge>
                    )}
                    {a.security_review_passed ? (
                      <Badge variant="default" className="text-xs gap-1"><Shield className="h-3 w-3" /> Security ✓</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs gap-1 text-card-foreground/40"><AlertTriangle className="h-3 w-3" /> Security pending</Badge>
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
