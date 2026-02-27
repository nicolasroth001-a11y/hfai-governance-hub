import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { fetchViolations } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const columns: DataTableColumn<any>[] = [
  { key: "id", header: "ID", render: (v) => <Link to={`/violations/${v.id}`} className="font-medium text-primary hover:underline">{v.id}</Link> },
  { key: "description", header: "Description", render: (v) => <span className="text-card-foreground text-sm max-w-xs truncate block">{v.description}</span> },
  { key: "severity", header: "Severity", render: (v) => <SeverityBadge severity={v.severity} /> },
  { key: "rule_id", header: "Rule", render: (v) => <span className="text-card-foreground/70 text-sm">{v.rule_id}</span> },
  { key: "detected_at", header: "Detected", render: (v) => <span className="text-card-foreground/70 text-sm">{v.detected_at ? formatDistanceToNow(new Date(v.detected_at), { addSuffix: true }) : "—"}</span> },
  { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status || "open"} /> },
];

export default function ViolationsList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolations()
      .then(setData)
      .catch((err) => console.error("Fetch violations error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeader title="Violations" description="Monitor and review AI governance violations" />
      {loading ? (
        <p className="text-sm text-card-foreground/50">Loading…</p>
      ) : (
        <DataTable columns={columns} data={data} rowKey={(v) => v.id} emptyMessage="No violations found" />
      )}
    </div>
  );
}
