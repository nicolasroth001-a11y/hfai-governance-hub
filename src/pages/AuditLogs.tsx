import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { mockAuditLogs } from "@/lib/mock-data";
import { format } from "date-fns";

type AuditLog = (typeof mockAuditLogs)[number];

const columns: DataTableColumn<AuditLog>[] = [
  {
    key: "timestamp",
    header: "Timestamp",
    render: (log) => (
      <span className="text-card-foreground/70 font-mono text-xs">
        {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
      </span>
    ),
  },
  {
    key: "action",
    header: "Action",
    render: (log) => <span className="text-card-foreground text-sm capitalize">{log.action.replace(/_/g, " ")}</span>,
  },
  { key: "actor", header: "Actor", render: (log) => <span className="text-card-foreground/70 text-sm">{log.actor}</span> },
  {
    key: "entity",
    header: "Entity",
    render: (log) => <span className="text-card-foreground/70 text-sm">{log.entity_type} / {log.entity_id}</span>,
  },
  {
    key: "details",
    header: "Details",
    render: (log) => <span className="text-card-foreground/60 text-sm max-w-xs truncate block">{log.details}</span>,
  },
];

export default function AuditLogs() {
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const actions = [...new Set(mockAuditLogs.map((l) => l.action))];
  const entityTypes = [...new Set(mockAuditLogs.map((l) => l.entity_type))];

  const filtered = mockAuditLogs.filter((log) => {
    if (actionFilter !== "all" && log.action !== actionFilter) return false;
    if (entityFilter !== "all" && log.entity_type !== entityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="Audit Logs" description="Complete activity log" />

      <div className="flex gap-3">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px] bg-secondary border-border text-secondary-foreground">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[160px] bg-secondary border-border text-secondary-foreground">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {entityTypes.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} rowKey={(log) => log.id} />
    </div>
  );
}
