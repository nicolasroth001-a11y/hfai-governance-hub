import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { fetchAuditLogs } from "@/lib/api";
import { format } from "date-fns";

const columns: DataTableColumn<any>[] = [
  { key: "created_at", header: "Time", render: (l) => <span className="text-xs text-card-foreground/60 font-mono">{format(new Date(l.created_at), "MMM d, HH:mm:ss")}</span> },
  { key: "action", header: "Action", render: (l) => <span className="text-sm text-card-foreground font-medium">{l.action.replace(/_/g, " ")}</span> },
  { key: "entity", header: "Entity", render: (l) => <span className="text-xs font-mono text-card-foreground/50">{l.entity_type}/{l.entity_id}</span> },
  { key: "details", header: "Details", render: (l) => <span className="text-xs text-card-foreground/50 line-clamp-1">{l.details}</span> },
];

export default function CustomerLogs() {
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

  const actions = [...new Set(data.map((l) => l.action))];
  const entities = [...new Set(data.map((l) => l.entity_type))];

  const filtered = data.filter((l) =>
    (actionFilter === "all" || l.action === actionFilter) &&
    (entityFilter === "all" || l.entity_type === entityFilter)
  );

  return (
    <SubscriptionGate feature="Audit Logs">
      <div className="space-y-section">
        <SectionHeader title="Audit Logs" description="Complete activity log" />
        <FilterBar filters={[
          { key: "action", label: "Action", value: actionFilter, onChange: setActionFilter, options: actions.map((a) => ({ label: a.replace(/_/g, " "), value: a })) },
          { key: "entity", label: "Entity", value: entityFilter, onChange: setEntityFilter, options: entities.map((e) => ({ label: e, value: e })) },
        ]} />
        <DataTable columns={columns} data={filtered} rowKey={(l) => l.id} loading={loading} emptyMessage="No logs found" />
      </div>
    </SubscriptionGate>
  );
}