import { useState } from "react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { mockViolations } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";

type Violation = (typeof mockViolations)[number];

const columns: DataTableColumn<Violation>[] = [
  {
    key: "id",
    header: "ID",
    render: (v) => (
      <Link to={`/violations/${v.id}`} className="font-medium text-primary hover:underline">{v.id}</Link>
    ),
  },
  {
    key: "description",
    header: "Description",
    render: (v) => <span className="text-card-foreground text-sm max-w-xs truncate block">{v.description}</span>,
  },
  { key: "severity", header: "Severity", render: (v) => <SeverityBadge severity={v.severity} /> },
  {
    key: "rule_id",
    header: "Rule",
    render: (v) => <span className="text-card-foreground/70 text-sm">{v.rule_id}</span>,
  },
  {
    key: "detected_at",
    header: "Detected",
    render: (v) => (
      <span className="text-card-foreground/70 text-sm">
        {formatDistanceToNow(new Date(v.detected_at), { addSuffix: true })}
      </span>
    ),
  },
  { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status} /> },
];

export default function ViolationsList() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockViolations.filter((v) => {
    if (severityFilter !== "all" && v.severity !== severityFilter) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="Violations" description="Monitor and review AI governance violations" />

      <div className="flex gap-3">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[160px] bg-secondary border-border text-secondary-foreground">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-secondary border-border text-secondary-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(v) => v.id}
        emptyMessage="No violations match filters"
      />
    </div>
  );
}
