import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchAISystems, createAISystem } from "@/lib/api";

const mockSystems = [
  { id: "SYS-001", name: "Customer Support Bot", model_type: "gpt-4-turbo", risk_level: "high", provider: "OpenAI" },
  { id: "SYS-002", name: "Hiring Screener", model_type: "llama3-70b", risk_level: "critical", provider: "Meta" },
];

const columns: DataTableColumn<any>[] = [
  { key: "id", header: "ID", render: (s) => <span className="text-primary font-medium">{s.id}</span> },
  { key: "name", header: "Name", render: (s) => <span className="text-sm font-medium text-card-foreground">{s.name}</span> },
  { key: "model_type", header: "Model", render: (s) => <span className="text-xs text-card-foreground/60 font-mono">{s.model_type || "—"}</span> },
  { key: "risk_level", header: "Risk Level", render: (s) => <span className="text-xs text-card-foreground/60">{s.risk_level || "—"}</span> },
  { key: "provider", header: "Provider", render: (s) => <span className="text-xs text-card-foreground/60">{s.provider || "—"}</span> },
];

export default function CustomerAISystems() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", model_type: "", provider: "", version: "", risk_level: "" });
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAISystems()
      .then(setSystems)
      .catch(() => setSystems(mockSystems))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createAISystem({ ...form, org_id: "" });
      toast({ title: "AI System created", description: `System "${result.name}" registered` });
      setSystems((prev) => [result, ...prev]);
      setShowCreate(false);
      setForm({ name: "", description: "", model_type: "", provider: "", version: "", risk_level: "" });
    } catch (err: any) {
      toast({ title: "Error creating system", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-section">
      <div className="flex items-center justify-between">
        <SectionHeader title="AI Systems" description="Manage your registered AI systems" />
        <Button onClick={() => setShowCreate(!showCreate)} variant={showCreate ? "secondary" : "default"} className="gap-2">
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? "Cancel" : "Register System"}
        </Button>
      </div>

      {showCreate && (
        <ContentCard icon={Cpu} title="Register New AI System">
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>System Name</Label>
              <Input placeholder="e.g. Customer Support Bot" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Model Type</Label>
              <Input placeholder="e.g. gpt-4-turbo" value={form.model_type} onChange={(e) => setForm({ ...form, model_type: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Provider</Label>
              <Input placeholder="e.g. OpenAI" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={form.risk_level} onValueChange={(v) => setForm({ ...form, risk_level: v })}>
                <SelectTrigger><SelectValue placeholder="Select risk level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe this AI system..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit">Register System</Button>
            </div>
          </form>
        </ContentCard>
      )}

      {loading ? (
        <p className="text-sm text-card-foreground/50">Loading…</p>
      ) : (
        <DataTable columns={columns} data={systems} rowKey={(s) => s.id} emptyMessage="No AI systems registered" />
      )}
    </div>
  );
}
