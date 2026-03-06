import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar } from "@/components/FilterBar";
import { fetchViolations } from "@/lib/api";
import { mockViolations } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";

const columns: DataTableColumn<any>[] = [
  { key: "id", header: "ID", render: (v) => <Link to={`/customer/violations/${v.id}`} className="text-primary font-medium hover:underline">{v.id}</Link> },
  { key: "description", header: "Description", render: (v) => <span className="text-sm text-card-foreground line-clamp-1">{v.description}</span> },
  { key: "severity", header: "Severity", render: (v) => <SeverityBadge severity={v.severity} /> },
  { key: "rule_id", header: "Rule", render: (v) => <span className="text-xs font-mono text-card-foreground/60">{v.rule_id}</span> },
  { key: "detected_at", header: "Detected", render: (v) => <span className="text-xs text-card-foreground/50">{v.detected_at ? formatDistanceToNow(new Date(v.detected_at), { addSuffix: true }) : "—"}</span> },
  { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status || "open"} /> },
];

export default function CustomerViolations() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolations()
      .then(setData)
      .catch(() => setData(mockViolations))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter((v) =>
    (severityFilter === "all" || v.severity === severityFilter) &&
    (statusFilter === "all" || v.status === statusFilter)
  );

  return (
    <div className="space-y-8">
      <SectionHeader title="Violations" description="AI governance violations detected in your systems" />
      <FilterBar filters={[
        { key: "severity", label: "Severity", value: severityFilter, onChange: setSeverityFilter, options: [{ label: "Critical", value: "critical" }, { label: "High", value: "high" }, { label: "Medium", value: "medium" }, { label: "Low", value: "low" }] },
        { key: "status", label: "Status", value: statusFilter, onChange: setStatusFilter, options: [{ label: "Open", value: "open" }, { label: "Under Review", value: "under_review" }, { label: "Resolved", value: "resolved" }] },
      ]} />
      <DataTable columns={columns} data={filtered} rowKey={(v) => v.id} loading={loading} emptyMessage="No violations found" />
    </div>
  );
}
