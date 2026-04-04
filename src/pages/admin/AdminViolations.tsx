import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar } from "@/components/FilterBar";
import { fetchViolations } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function AdminViolations() {
  const { t } = useTranslation();
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolations()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const columns: DataTableColumn<any>[] = [
    { key: "id", header: t("adminViolations.id"), render: (v) => <Link to={`/admin/violations/${v.id}`} className="text-primary font-medium hover:underline">{typeof v.id === "string" ? v.id.slice(0, 8) : v.id}</Link> },
    { key: "description", header: t("adminViolations.descriptionCol"), render: (v) => <span className="text-sm text-card-foreground line-clamp-1">{v.description}</span> },
    { key: "severity", header: t("adminViolations.severity"), render: (v) => <SeverityBadge severity={v.severity} /> },
    { key: "rule_id", header: t("adminViolations.rule"), render: (v) => <span className="text-xs font-mono text-card-foreground/60">{v.rule_id ? (typeof v.rule_id === "string" ? v.rule_id.slice(0, 8) : v.rule_id) : "—"}</span> },
    { key: "detected_at", header: t("adminViolations.detected"), render: (v) => <span className="text-xs text-card-foreground/50">{v.detected_at ? formatDistanceToNow(new Date(v.detected_at), { addSuffix: true }) : "—"}</span> },
    { key: "status", header: t("adminViolations.status"), render: (v) => <StatusBadge status={v.status || "open"} /> },
  ];

  const filtered = data.filter((v) =>
    (severityFilter === "all" || v.severity === severityFilter) &&
    (statusFilter === "all" || v.status === statusFilter)
  );

  return (
    <div className="space-y-8">
      <SectionHeader title={t("adminViolations.title")} description={t("adminViolations.description")} />
      <FilterBar filters={[
        { key: "severity", label: t("adminViolations.severity"), value: severityFilter, onChange: setSeverityFilter, options: [{ label: t("adminViolations.critical"), value: "critical" }, { label: t("adminViolations.high"), value: "high" }, { label: t("adminViolations.medium"), value: "medium" }, { label: t("adminViolations.low"), value: "low" }] },
        { key: "status", label: t("adminViolations.status"), value: statusFilter, onChange: setStatusFilter, options: [{ label: t("adminViolations.open"), value: "open" }, { label: t("adminViolations.underReview"), value: "under_review" }, { label: t("adminViolations.resolved"), value: "resolved" }] },
      ]} />
      <DataTable columns={columns} data={filtered} rowKey={(v) => v.id} loading={loading} emptyMessage={t("adminViolations.noViolations")} />
    </div>
  );
}
