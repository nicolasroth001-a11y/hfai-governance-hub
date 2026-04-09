import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { fetchViolations } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, Plug } from "lucide-react";

export default function CustomerViolations() {
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
    { key: "id", header: t("customerViolations.id"), render: (v) => <Link to={`/customer/violations/${v.id}`} className="text-primary font-medium hover:underline text-xs font-mono">{typeof v.id === "string" ? v.id.slice(0, 8) : v.id}</Link> },
    { key: "description", header: t("customerViolations.descriptionCol"), render: (v) => <span className="text-sm text-card-foreground line-clamp-1">{v.description}</span> },
    { key: "severity", header: t("customerViolations.severity"), render: (v) => <SeverityBadge severity={v.severity} /> },
    { key: "detected_at", header: t("customerViolations.detected"), render: (v) => <span className="text-xs text-card-foreground/50">{v.detected_at ? formatDistanceToNow(new Date(v.detected_at), { addSuffix: true }) : "—"}</span> },
    { key: "status", header: t("customerViolations.status"), render: (v) => <StatusBadge status={v.status || "open"} /> },
  ];

  const filtered = data.filter((v) =>
    (severityFilter === "all" || v.severity === severityFilter) &&
    (statusFilter === "all" || v.status === statusFilter)
  );

  return (
    <div className="space-y-8">
      <SectionHeader title={t("customerViolations.title")} description={t("customerViolations.description")} />
      <FilterBar filters={[
        { key: "severity", label: t("customerViolations.severity"), value: severityFilter, onChange: setSeverityFilter, options: [{ label: t("customerViolations.critical"), value: "critical" }, { label: t("customerViolations.high"), value: "high" }, { label: t("customerViolations.medium"), value: "medium" }, { label: t("customerViolations.low"), value: "low" }] },
        { key: "status", label: t("customerViolations.status"), value: statusFilter, onChange: setStatusFilter, options: [{ label: t("customerViolations.open"), value: "open" }, { label: t("customerViolations.investigating"), value: "investigating" }, { label: t("customerViolations.resolved"), value: "resolved" }] },
      ]} />
      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(v) => v.id}
        loading={loading}
        emptyContent={
          <>
            <ShieldCheck className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-card-foreground/60 max-w-xs">No violations detected yet. Connect an AI system and send events to start monitoring.</p>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/customer/connect"><Plug className="h-3.5 w-3.5" /> Connect AI System</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
