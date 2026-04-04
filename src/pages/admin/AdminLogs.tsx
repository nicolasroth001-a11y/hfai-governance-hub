import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { fetchAuditLogs } from "@/lib/api";
import { format } from "date-fns";

export default function AdminLogs() {
  const { t } = useTranslation();
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const columns: DataTableColumn<any>[] = [
    { key: "created_at", header: t("adminLogs.time"), render: (l) => <span className="text-xs text-card-foreground/60 font-mono">{format(new Date(l.created_at), "MMM d, HH:mm:ss")}</span> },
    { key: "action", header: t("adminLogs.action"), render: (l) => <span className="text-sm text-card-foreground font-medium">{l.action.replace(/_/g, " ")}</span> },
    { key: "entity", header: t("adminLogs.entity"), render: (l) => <span className="text-xs font-mono text-card-foreground/50">{l.entity_type}/{l.entity_id}</span> },
    { key: "details", header: t("adminLogs.details"), render: (l) => <span className="text-xs text-card-foreground/50 line-clamp-1">{l.details}</span> },
  ];

  const actions = [...new Set(data.map((l) => l.action))];
  const entities = [...new Set(data.map((l) => l.entity_type))];

  const filtered = data.filter((l) =>
    (actionFilter === "all" || l.action === actionFilter) &&
    (entityFilter === "all" || l.entity_type === entityFilter)
  );

  return (
    <div className="space-y-section">
      <SectionHeader title={t("adminLogs.title")} description={t("adminLogs.description")} />
      <FilterBar filters={[
        { key: "action", label: t("adminLogs.action"), value: actionFilter, onChange: setActionFilter, options: actions.map((a) => ({ label: a.replace(/_/g, " "), value: a })) },
        { key: "entity", label: t("adminLogs.entity"), value: entityFilter, onChange: setEntityFilter, options: entities.map((e) => ({ label: e, value: e })) },
      ]} />
      <DataTable columns={columns} data={filtered} rowKey={(l) => l.id} loading={loading} emptyMessage={t("adminLogs.noLogs")} />
    </div>
  );
}
