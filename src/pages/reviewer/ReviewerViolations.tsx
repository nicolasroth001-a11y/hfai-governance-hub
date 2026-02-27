import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar } from "@/components/FilterBar";
import { mockViolations } from "@/lib/mock-data";
import { fetchViolations } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

type Violation = (typeof mockViolations)[number];

const columns: DataTableColumn<Violation>[] = [
  { key: "id", header: "ID", render: (v) => <Link to={`/reviewer/violations/${v.id}`} className="text-primary font-medium hover:underline">{v.id}</Link> },
  { key: "description", header: "Description", render: (v) => <span className="text-sm text-card-foreground line-clamp-1">{v.description}</span> },
  { key: "severity", header: "Severity", render: (v) => <SeverityBadge severity={v.severity} /> },
  { key: "detected_at", header: "Detected", render: (v) => <span className="text-xs text-card-foreground/50">{formatDistanceToNow(new Date(v.detected_at), { addSuffix: true })}</span> },
  { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status} /> },
];

export default function ReviewerViolations() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [ruleFilter, setRuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [data, setData] = useState<any[]>(mockViolations);

  useEffect(() => {
    fetchViolations().then((rows) => {
      if (Array.isArray(rows) && rows.length > 0) setData(rows);
    }).catch(() => {});
  }, []);

  const assigned = data.filter((v) => v.assigned_reviewer === "reviewer@hfai.com");
  const filtered = assigned.filter((v) => {
    if (severityFilter !== "all" && v.severity !== severityFilter) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    if (ruleFilter !== "all" && v.rule_id !== ruleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <SectionHeader title="Assigned Violations" description="Violations assigned to you for review" />
      <FilterBar filters={[
        { key: "severity", label: "Severity", value: severityFilter, onChange: setSeverityFilter, options: [{ label: "Critical", value: "critical" }, { label: "High", value: "high" }, { label: "Medium", value: "medium" }, { label: "Low", value: "low" }] },
        { key: "customer", label: "Customer", value: customerFilter, onChange: setCustomerFilter, options: [{ label: "Acme Corp", value: "acme" }, { label: "TechStart Inc", value: "techstart" }, { label: "DataFlow AI", value: "dataflow" }] },
        { key: "rule", label: "Rule", value: ruleFilter, onChange: setRuleFilter, options: [{ label: "RULE-001", value: "RULE-001" }, { label: "RULE-002", value: "RULE-002" }, { label: "RULE-003", value: "RULE-003" }] },
        { key: "status", label: "Status", value: statusFilter, onChange: setStatusFilter, options: [{ label: "Open", value: "open" }, { label: "Approved", value: "approved" }, { label: "Rejected", value: "rejected" }] },
      ]} />
      <DataTable columns={columns} data={filtered} rowKey={(v) => v.id} emptyMessage="No violations assigned" />
    </div>
  );
}
