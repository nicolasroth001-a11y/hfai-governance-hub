import { useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Button } from "@/components/ui/button";
import { mockRules } from "@/lib/mock-data";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Rule = (typeof mockRules)[number];

const columns: DataTableColumn<Rule>[] = [
  { key: "id", header: "ID", render: (r) => <Link to={`/admin/rules/${r.id}`} className="text-primary font-medium hover:underline">{r.id}</Link> },
  { key: "name", header: "Name", render: (r) => <span className="text-sm font-medium text-card-foreground">{r.name}</span> },
  { key: "category", header: "Category", render: (r) => <span className="text-xs text-card-foreground/60">{r.category}</span> },
  { key: "severity", header: "Severity", render: (r) => <SeverityBadge severity={r.severity_default} /> },
  { key: "status", header: "Status", render: (r) => <span className={`text-xs font-medium ${r.status === "active" ? "text-success" : "text-card-foreground/40"}`}>{r.status}</span> },
  { key: "violations", header: "Violations", render: (r) => <span className="text-sm text-card-foreground">{r.violations_count}</span> },
];

export default function AdminRules() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-section">
      <div className="flex items-center justify-between">
        <SectionHeader title="Rules Management" description="Create and manage AI governance rules" />
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Create Rule
        </Button>
      </div>

      {showCreate && (
        <Card className="p-card space-y-4">
          <h3 className="text-sm font-semibold text-card-foreground">New Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Name</Label>
              <Input placeholder="Rule name" className="bg-card border-card-foreground/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Category</Label>
              <Input placeholder="e.g. Privacy, Fairness" className="bg-card border-card-foreground/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Default Severity</Label>
              <Select>
                <SelectTrigger className="bg-card border-card-foreground/10"><SelectValue placeholder="Select severity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-card-foreground">Description</Label>
            <Textarea placeholder="Describe the rule..." className="bg-card border-card-foreground/10 resize-none" rows={3} />
          </div>
          <div className="flex gap-3">
            <Button className="bg-primary text-primary-foreground">Save Rule</Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <DataTable columns={columns} data={mockRules} rowKey={(r) => r.id} />
    </div>
  );
}
