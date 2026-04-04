import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Cpu, Plus, X, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchAISystems, createAISystem } from "@/lib/api";

const riskVariant = (level: string) =>
  level === "critical" ? "destructive" : level === "high" ? "destructive" : level === "medium" ? "secondary" : "outline";

export default function CustomerAISystems() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", model_type: "", provider: "", version: "", risk_level: "", owner_team: "" });
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAISystems()
      .then(setSystems)
      .catch(() => setSystems([]))
      .finally(() => setLoading(false));
  }, []);

  const columns: DataTableColumn<any>[] = [
    { key: "id", header: t("customerAISystems.id"), render: (s) => <Link to={`/customer/ai-systems/${s.id}`} className="text-primary font-medium hover:underline text-xs font-mono">{typeof s.id === 'string' ? s.id.slice(0, 8) : s.id}</Link> },
    { key: "name", header: t("customerAISystems.name"), render: (s) => <Link to={`/customer/ai-systems/${s.id}`} className="text-sm font-medium text-card-foreground hover:underline">{s.name}</Link> },
    { key: "model_type", header: t("customerAISystems.model"), render: (s) => <span className="text-xs text-card-foreground/60 font-mono">{s.model_type || "—"}</span> },
    { key: "risk_level", header: t("customerAISystems.risk"), render: (s) => <Badge variant={riskVariant(s.risk_level)} className="capitalize text-xs">{s.risk_level || "—"}</Badge> },
    { key: "provider", header: t("customerAISystems.provider"), render: (s) => <span className="text-xs text-card-foreground/60">{s.provider || "—"}</span> },
    { key: "owner_team", header: t("customerAISystems.owner"), render: (s) => <span className="text-xs text-card-foreground/60">{s.owner_team || "—"}</span> },
  ];

  const filtered = systems.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.model_type?.toLowerCase().includes(q) ||
      s.provider?.toLowerCase().includes(q) ||
      s.owner_team?.toLowerCase().includes(q)
    );
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createAISystem({ ...form, org_id: profile?.org_id || "" });
      toast({ title: t("customerAISystems.systemCreated"), description: t("customerAISystems.systemCreatedDesc", { name: result.name }) });
      setSystems((prev) => [result, ...prev]);
      setShowCreate(false);
      setForm({ name: "", description: "", model_type: "", provider: "", version: "", risk_level: "", owner_team: "" });
    } catch (err: any) {
      toast({ title: t("customerAISystems.createError"), description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-section">
      <div className="flex items-center justify-between">
        <SectionHeader title={t("customerAISystems.title")} description={t("customerAISystems.description")} />
        <Button onClick={() => setShowCreate(!showCreate)} variant={showCreate ? "secondary" : "default"} className="gap-2">
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? t("customerAISystems.cancel") : t("customerAISystems.addNew")}
        </Button>
      </div>

      {showCreate && (
        <ContentCard icon={Cpu} title={t("customerAISystems.registerNew")}>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("customerAISystems.systemName")}</Label>
              <Input placeholder="e.g. Customer Support Bot" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>{t("customerAISystems.modelType")}</Label>
              <Input placeholder="e.g. LLM, Vision, Custom" value={form.model_type} onChange={(e) => setForm({ ...form, model_type: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("customerAISystems.provider")}</Label>
              <Input placeholder="e.g. OpenAI, Anthropic" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("customerAISystems.version")}</Label>
              <Input placeholder="e.g. v1.0" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("customerAISystems.ownerTeam")}</Label>
              <Input placeholder="e.g. ML Engineering" value={form.owner_team} onChange={(e) => setForm({ ...form, owner_team: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("customerAISystems.riskLevel")}</Label>
              <Select value={form.risk_level} onValueChange={(v) => setForm({ ...form, risk_level: v })}>
                <SelectTrigger><SelectValue placeholder={t("customerAISystems.riskLevel")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("customerViolations.low")}</SelectItem>
                  <SelectItem value="medium">{t("customerViolations.medium")}</SelectItem>
                  <SelectItem value="high">{t("customerViolations.high")}</SelectItem>
                  <SelectItem value="critical">{t("customerViolations.critical")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("customerAISystems.descriptionLabel")}</Label>
              <Textarea placeholder="Describe this AI system…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit">{t("customerAISystems.registerBtn")}</Button>
            </div>
          </form>
        </ContentCard>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("customerAISystems.searchSystems")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <DataTable columns={columns} data={filtered} rowKey={(s) => s.id} loading={loading} emptyMessage={t("customerAISystems.noSystems")} />
    </div>
  );
}
