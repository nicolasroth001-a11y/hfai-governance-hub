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

export default function ReviewerViolations() {
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
    { key: "id", header: t("reviewerViolations.id"), render: (v) => <Link to={`/reviewer/violations/${v.id}`} className="text-primary font-medium hover:underline">{typeof v.id === "string" ? v.id.slice(0, 8) : v.id}</Link> },
    { key: "description", header: t("reviewerViolations.descriptionCol"), render: (v) => <span className="text-sm text-card-foreground line-clamp-1">{v.description}</span> },
    { key: "severity", header: t("reviewerViolations.severity"), render: (v) => <SeverityBadge severity={v.severity} /> },
    { key: "detected_at", header: t("reviewerViolations.detected"), render: (v) => <span className="text-xs text-card-foreground/50">{v.detected_at ? formatDistanceToNow(new Date(v.detected_at), { addSuffix: true }) : "—"}</span> },
    { key: "status", header: t("reviewerViolations.status"), render: (v) => <StatusBadge status={v.status || "open"} /> },
  ];

  const filtered = data.filter((v) => {
    if (severityFilter !== "all" && v.severity !== severityFilter) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <SectionHeader title={t("reviewerViolations.title")} description={t("reviewerViolations.description")} />
      <FilterBar filters={[
        { key: "severity", label: t("reviewerViolations.severity"), value: severityFilter, onChange: setSeverityFilter, options: [{ label: t("reviewerViolations.critical"), value: "critical" }, { label: t("reviewerViolations.high"), value: "high" }, { label: t("reviewerViolations.medium"), value: "medium" }, { label: t("reviewerViolations.low"), value: "low" }] },
        { key: "status", label: t("reviewerViolations.status"), value: statusFilter, onChange: setStatusFilter, options: [{ label: t("reviewerViolations.open"), value: "open" }, { label: t("reviewerViolations.underReview"), value: "under_review" }, { label: t("reviewerViolations.resolved"), value: "resolved" }] },
      ]} />
      <DataTable columns={columns} data={filtered} rowKey={(v) => v.id} loading={loading} emptyMessage={t("reviewerViolations.noViolations")} />
    </div>
  );
}
