import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchAISystem, updateAISystem, fetchAIEvents, fetchViolationsBySystem, fetchReviewsByViolations } from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Cpu, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const eventColumns: DataTableColumn<any>[] = [
  { key: "event_type", header: "Type", render: (e) => <Badge variant="outline" className="text-xs">{e.event_type}</Badge> },
  { key: "input_text", header: "Input", render: (e) => <span className="text-sm text-card-foreground line-clamp-1 max-w-xs">{e.input_text || (typeof e.payload === "string" ? e.payload : "—")}</span> },
  { key: "output_text", header: "Output", render: (e) => <span className="text-sm text-card-foreground/60 line-clamp-1 max-w-xs">{e.output_text || "—"}</span> },
  { key: "created_at", header: "Time", render: (e) => <span className="text-xs text-card-foreground/50">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</span> },
];

const violationColumns: DataTableColumn<any>[] = [
  { key: "id", header: "ID", render: (v) => <Link to={`/customer/violations/${v.id}`} className="text-primary font-medium hover:underline text-xs">{v.id.slice(0, 8)}</Link> },
  { key: "description", header: "Description", render: (v) => <span className="text-sm text-card-foreground line-clamp-1">{v.description}</span> },
  { key: "severity", header: "Severity", render: (v) => <SeverityBadge severity={v.severity} /> },
  { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status || "open"} /> },
];

const reviewColumns: DataTableColumn<any>[] = [
  { key: "decision", header: "Decision", render: (r) => <Badge variant={r.decision === "approved" ? "default" : "destructive"} className="text-xs capitalize">{r.decision}</Badge> },
  { key: "reviewer_name", header: "Reviewer", render: (r) => <span className="text-sm text-card-foreground">{r.reviewer_name || "—"}</span> },
  { key: "comments", header: "Notes", render: (r) => <span className="text-sm text-card-foreground/60 line-clamp-1">{r.comments || "—"}</span> },
  { key: "created_at", header: "Time", render: (r) => <span className="text-xs text-card-foreground/50">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span> },
];

export default function CustomerAISystemDetail() {
  const { id } = useParams();
  const [system, setSystem] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchAISystem(id),
      fetchAIEvents({ ai_system_id: id }),
      fetchViolationsBySystem(id),
    ]).then(async ([sys, evts, viols]) => {
      setSystem(sys);
      setEditForm(sys);
      setEvents(evts);
      setViolations(viols);
      const violIds = viols.map((v: any) => v.id);
      const revs = await fetchReviewsByViolations(violIds);
      setReviews(revs);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id || !editForm) return;
    setSaving(true);
    try {
      const updated = await updateAISystem(id, {
        name: editForm.name,
        description: editForm.description,
        model_type: editForm.model_type,
        provider: editForm.provider,
        version: editForm.version,
        risk_level: editForm.risk_level,
        owner_team: editForm.owner_team,
      });
      setSystem(updated);
      toast({ title: "Saved", description: "System settings updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-card-foreground/50 py-10 text-center">Loading…</p>;
  if (!system) return <p className="text-sm text-destructive py-10 text-center">System not found.</p>;

  const riskColor = system.risk_level === "high" || system.risk_level === "critical" ? "destructive" : system.risk_level === "medium" ? "secondary" : "outline";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/customer/ai-systems" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <SectionHeader title={system.name} description={system.description || "AI System"} />
        <Badge variant={riskColor} className="ml-auto capitalize">{system.risk_level} risk</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="violations">Violations ({violations.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Model", value: system.model_type },
              { label: "Provider", value: system.provider },
              { label: "Version", value: system.version },
              { label: "Owner Team", value: system.owner_team },
              { label: "Risk Level", value: system.risk_level },
              { label: "Status", value: system.status },
            ].map((item) => (
              <ContentCard key={item.label} title={item.label}>
                <p className="text-sm text-card-foreground font-medium capitalize">{item.value || "—"}</p>
              </ContentCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <DataTable columns={eventColumns} data={events} rowKey={(e) => e.id} emptyMessage="No events recorded" />
        </TabsContent>

        <TabsContent value="violations">
          <DataTable columns={violationColumns} data={violations} rowKey={(v) => v.id} emptyMessage="No violations detected" />
        </TabsContent>

        <TabsContent value="reviews">
          <DataTable columns={reviewColumns} data={reviews} rowKey={(r) => r.id} emptyMessage="No reviews yet" />
        </TabsContent>

        <TabsContent value="settings">
          <ContentCard icon={Cpu} title="Edit System">
            {editForm && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Model Type</Label>
                  <Input value={editForm.model_type || ""} onChange={(e) => setEditForm({ ...editForm, model_type: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Input value={editForm.provider || ""} onChange={(e) => setEditForm({ ...editForm, provider: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input value={editForm.version || ""} onChange={(e) => setEditForm({ ...editForm, version: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Owner Team</Label>
                  <Input value={editForm.owner_team || ""} onChange={(e) => setEditForm({ ...editForm, owner_team: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Risk Level</Label>
                  <Select value={editForm.risk_level || ""} onValueChange={(v) => setEditForm({ ...editForm, risk_level: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                  <Textarea value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </ContentCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
