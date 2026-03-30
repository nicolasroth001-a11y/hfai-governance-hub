import { useState, useEffect, useCallback } from "react";
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
  Database,
  Plus,
  MapPin,
  FileText,
  AlertTriangle,
  Trash2,
  Loader2,
  Link,
} from "lucide-react";
import { format } from "date-fns";

interface AISystem { id: string; name: string; }

interface LineageRecord {
  id: string;
  ai_system_id: string;
  data_source_name: string;
  data_source_type: string;
  data_description: string;
  collection_method: string;
  consent_basis: string;
  retention_period: string;
  geographic_origin: string;
  pii_detected: boolean;
  quality_score: number | null;
  notes: string;
  created_at: string;
}

const SOURCE_TYPES = [
  { value: "api", label: "API" },
  { value: "database", label: "Database" },
  { value: "file", label: "File Upload" },
  { value: "third_party", label: "Third-Party Provider" },
  { value: "web_scrape", label: "Web Scraping" },
  { value: "user_input", label: "User Input" },
];

const CONSENT_BASES = [
  { value: "consent", label: "Consent (Art. 6(1)(a))" },
  { value: "contract", label: "Contract (Art. 6(1)(b))" },
  { value: "legal_obligation", label: "Legal Obligation (Art. 6(1)(c))" },
  { value: "vital_interest", label: "Vital Interest (Art. 6(1)(d))" },
  { value: "public_interest", label: "Public Interest (Art. 6(1)(e))" },
  { value: "legitimate_interest", label: "Legitimate Interest (Art. 6(1)(f))" },
];

export default function CustomerDataLineage() {
  const { profile } = useAuth();
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [records, setRecords] = useState<LineageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [form, setForm] = useState({
    ai_system_id: "",
    data_source_name: "",
    data_source_type: "api",
    data_description: "",
    collection_method: "",
    consent_basis: "consent",
    retention_period: "",
    geographic_origin: "",
    pii_detected: false,
    quality_score: "",
    notes: "",
  });
  const orgId = profile?.org_id;

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const [sysRes, lineageRes] = await Promise.all([
      supabase.from("ai_systems").select("id, name").eq("org_id", orgId),
      supabase.from("data_lineage_records").select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
    ]);
    setSystems((sysRes.data as AISystem[]) || []);
    setRecords((lineageRes.data as LineageRecord[]) || []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!orgId || !form.ai_system_id || !form.data_source_name) {
      toast({ title: "Fill required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("data_lineage_records").insert({
      ai_system_id: form.ai_system_id,
      org_id: orgId,
      data_source_name: form.data_source_name,
      data_source_type: form.data_source_type,
      data_description: form.data_description,
      collection_method: form.collection_method,
      consent_basis: form.consent_basis,
      retention_period: form.retention_period,
      geographic_origin: form.geographic_origin,
      pii_detected: form.pii_detected,
      quality_score: form.quality_score ? parseFloat(form.quality_score) : null,
      notes: form.notes,
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Data source recorded" });
      setShowForm(false);
      setForm({ ai_system_id: "", data_source_name: "", data_source_type: "api", data_description: "", collection_method: "", consent_basis: "consent", retention_period: "", geographic_origin: "", pii_detected: false, quality_score: "", notes: "" });
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("data_lineage_records").delete().eq("id", id);
    loadData();
  };

  const filtered = selectedSystem === "all" ? records : records.filter((r) => r.ai_system_id === selectedSystem);
  const piiCount = filtered.filter((r) => r.pii_detected).length;
  const uniqueOrigins = [...new Set(filtered.map((r) => r.geographic_origin).filter(Boolean))];

  return (
    <SubscriptionGate feature="Data Lineage">
      <div className="space-y-6">
        <SectionHeader title="Data Lineage & Provenance" description="Track training data sources and GDPR legal basis — EU AI Act Art. 10" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Data Sources</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">{filtered.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">PII Detected</p>
            <p className={`text-2xl font-bold mt-1 ${piiCount > 0 ? "text-warning" : "text-card-foreground"}`}>{piiCount}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Geographic Origins</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">{uniqueOrigins.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Systems Mapped</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">{new Set(filtered.map((r) => r.ai_system_id)).size}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedSystem} onValueChange={setSelectedSystem}>
            <SelectTrigger className="w-[200px] bg-card border-card-foreground/10"><SelectValue placeholder="Filter by system" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Systems</SelectItem>
              {systems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Data Source
          </Button>
        </div>

        {showForm && (
          <ContentCard icon={Database} title="Record Data Source">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">AI System *</Label>
                <Select value={form.ai_system_id} onValueChange={(v) => setForm({ ...form, ai_system_id: v })}>
                  <SelectTrigger className="bg-card border-card-foreground/10"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{systems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Source Name *</Label>
                <Input value={form.data_source_name} onChange={(e) => setForm({ ...form, data_source_name: e.target.value })} className="bg-card border-card-foreground/10" placeholder="e.g. Customer CRM Export" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Source Type</Label>
                <Select value={form.data_source_type} onValueChange={(v) => setForm({ ...form, data_source_type: v })}>
                  <SelectTrigger className="bg-card border-card-foreground/10"><SelectValue /></SelectTrigger>
                  <SelectContent>{SOURCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">GDPR Legal Basis</Label>
                <Select value={form.consent_basis} onValueChange={(v) => setForm({ ...form, consent_basis: v })}>
                  <SelectTrigger className="bg-card border-card-foreground/10"><SelectValue /></SelectTrigger>
                  <SelectContent>{CONSENT_BASES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Geographic Origin</Label>
                <Input value={form.geographic_origin} onChange={(e) => setForm({ ...form, geographic_origin: e.target.value })} className="bg-card border-card-foreground/10" placeholder="e.g. EU, US, Global" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Retention Period</Label>
                <Input value={form.retention_period} onChange={(e) => setForm({ ...form, retention_period: e.target.value })} className="bg-card border-card-foreground/10" placeholder="e.g. 24 months" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Collection Method</Label>
                <Input value={form.collection_method} onChange={(e) => setForm({ ...form, collection_method: e.target.value })} className="bg-card border-card-foreground/10" placeholder="e.g. API pull, manual upload" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-card-foreground/60">Quality Score (0–1)</Label>
                <Input type="number" step="0.01" min="0" max="1" value={form.quality_score} onChange={(e) => setForm({ ...form, quality_score: e.target.value })} className="bg-card border-card-foreground/10" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-xs text-card-foreground/60">Description</Label>
                <Textarea value={form.data_description} onChange={(e) => setForm({ ...form, data_description: e.target.value })} className="bg-card border-card-foreground/10" rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.pii_detected} onCheckedChange={(c) => setForm({ ...form, pii_detected: !!c })} />
                <Label className="text-xs text-card-foreground/60">Contains PII</Label>
              </div>
              <div className="sm:col-span-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Database className="h-4 w-4 mr-1" />}
                  Save Data Source
                </Button>
              </div>
            </div>
          </ContentCard>
        )}

        {loading ? (
          <p className="text-sm text-card-foreground/50 text-center py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <ContentCard icon={Database} title="No Data Sources Recorded">
            <p className="text-sm text-card-foreground/50">Document your AI training data sources and their provenance for Art. 10 compliance.</p>
          </ContentCard>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => {
              const system = systems.find((s) => s.id === r.ai_system_id);
              const sourceType = SOURCE_TYPES.find((t) => t.value === r.data_source_type);
              const consent = CONSENT_BASES.find((c) => c.value === r.consent_basis);
              return (
                <div key={r.id} className="bg-card rounded-xl border border-card-foreground/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{r.data_source_name}</p>
                        <p className="text-xs text-card-foreground/50">{system?.name} · {sourceType?.label || r.data_source_type}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="h-7 w-7 p-0 text-card-foreground/30 hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="mt-2 pl-8 flex flex-wrap items-center gap-2">
                    {r.pii_detected && (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <AlertTriangle className="h-3 w-3" /> PII
                      </Badge>
                    )}
                    {r.consent_basis && (
                      <Badge variant="outline" className="text-xs">{consent?.label || r.consent_basis}</Badge>
                    )}
                    {r.geographic_origin && (
                      <Badge variant="outline" className="text-xs gap-1"><MapPin className="h-3 w-3" /> {r.geographic_origin}</Badge>
                    )}
                    {r.retention_period && (
                      <Badge variant="outline" className="text-xs">{r.retention_period}</Badge>
                    )}
                    {r.quality_score !== null && (
                      <Badge variant="outline" className="text-xs">Quality: {r.quality_score}</Badge>
                    )}
                  </div>
                  {r.data_description && (
                    <p className="mt-2 pl-8 text-xs text-card-foreground/40">{r.data_description}</p>
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
