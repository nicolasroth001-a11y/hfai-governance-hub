import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchAISystems, createAISystem } from "@/lib/api";

interface AISystem {
  id: string;
  name: string;
  model: string;
  environment: string;
  status: string;
  created_at: string;
}

const fallbackSystems: AISystem[] = [
  { id: "AIS-001", name: "Customer Support Bot", model: "gpt-4-turbo", environment: "production", status: "active", created_at: "2025-12-01T00:00:00Z" },
  { id: "AIS-002", name: "Hiring Recommender", model: "gpt-4", environment: "production", status: "active", created_at: "2026-01-15T00:00:00Z" },
  { id: "AIS-003", name: "Content Moderator", model: "claude-3-opus", environment: "development", status: "active", created_at: "2026-02-10T00:00:00Z" },
];

const columns: DataTableColumn<AISystem>[] = [
  { key: "id", header: "ID", render: (s) => <span className="text-primary font-medium">{s.id}</span> },
  { key: "name", header: "Name", render: (s) => <span className="text-sm font-medium text-card-foreground">{s.name}</span> },
  { key: "model", header: "Model", render: (s) => <span className="text-xs text-card-foreground/60 font-mono">{s.model || (s as any).model_type}</span> },
  { key: "environment", header: "Environment", render: (s) => (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.environment === "production" ? "bg-primary/15 text-primary" : "bg-info/15 text-info"}`}>
      {s.environment}
    </span>
  )},
  { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status || "active"} /> },
];

export default function CustomerAISystems() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", model: "", environment: "" });
  const [systems, setSystems] = useState<any[]>(fallbackSystems);

  useEffect(() => {
    fetchAISystems().then((rows) => {
      if (Array.isArray(rows) && rows.length > 0) setSystems(rows);
    }).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createAISystem({
        name: form.name,
        description: form.description,
        model_type: form.model,
        provider: "",
        version: "",
        risk_level: form.environment,
      });
      toast({ title: "AI System created", description: `${form.name} has been registered.` });
      setSystems((prev) => [result, ...prev]);
      setShowCreate(false);
      setForm({ name: "", description: "", model: "", environment: "" });
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
              <Label>Model</Label>
              <Input placeholder="e.g. gpt-4-turbo" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Environment</Label>
              <Select value={form.environment} onValueChange={(v) => setForm({ ...form, environment: v })}>
                <SelectTrigger><SelectValue placeholder="Select environment" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
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

      <DataTable columns={columns} data={systems} rowKey={(s) => s.id} />
    </div>
  );
}
