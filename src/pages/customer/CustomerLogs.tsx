import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { mockAuditLogs } from "@/lib/mock-data";
import { format } from "date-fns";

type AuditLog = (typeof mockAuditLogs)[number];

const columns: DataTableColumn<AuditLog>[] = [
  { key: "timestamp", header: "Time", render: (l) => <span className="text-xs text-card-foreground/60 font-mono">{format(new Date(l.timestamp), "MMM d, HH:mm:ss")}</span> },
  { key: "action", header: "Action", render: (l) => <span className="text-sm text-card-foreground font-medium">{l.action.replace(/_/g, " ")}</span> },
  { key: "actor", header: "Actor", render: (l) => <span className="text-xs text-card-foreground/60">{l.actor}</span> },
  { key: "entity", header: "Entity", render: (l) => <span className="text-xs font-mono text-card-foreground/50">{l.entity_type}/{l.entity_id}</span> },
  { key: "details", header: "Details", render: (l) => <span className="text-xs text-card-foreground/50 line-clamp-1">{l.details}</span> },
];

export default function CustomerLogs() {
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const actions = [...new Set(mockAuditLogs.map((l) => l.action))];
  const entities = [...new Set(mockAuditLogs.map((l) => l.entity_type))];

  const filtered = mockAuditLogs.filter((l) =>
    (actionFilter === "all" || l.action === actionFilter) &&
    (entityFilter === "all" || l.entity_type === entityFilter)
  );

  return (
    <div className="space-y-section">
      <SectionHeader title="Audit Logs" description="Complete activity log" />
      <FilterBar filters={[
        { key: "action", label: "Action", value: actionFilter, onChange: setActionFilter, options: actions.map((a) => ({ label: a.replace(/_/g, " "), value: a })) },
        { key: "entity", label: "Entity", value: entityFilter, onChange: setEntityFilter, options: entities.map((e) => ({ label: e, value: e })) },
      ]} />
      <DataTable columns={columns} data={filtered} rowKey={(l) => l.id} />
    </div>
  );
}
