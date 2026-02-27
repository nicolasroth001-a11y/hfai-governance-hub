import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { fetchAuditLogs } from "@/lib/api";
import { format } from "date-fns";

const columns: DataTableColumn<any>[] = [
  { key: "created_at", header: "Timestamp", render: (log) => <span className="text-card-foreground/70 font-mono text-xs">{format(new Date(log.created_at), "MMM d, HH:mm:ss")}</span> },
  { key: "action", header: "Action", render: (log) => <span className="text-card-foreground text-sm capitalize">{log.action.replace(/_/g, " ")}</span> },
  { key: "entity", header: "Entity", render: (log) => <span className="text-card-foreground/70 text-sm">{log.entity_type} / {log.entity_id}</span> },
  { key: "details", header: "Details", render: (log) => <span className="text-card-foreground/60 text-sm max-w-xs truncate block">{log.details}</span> },
];

export default function AuditLogs() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs()
      .then(setData)
      .catch((err) => console.error("Fetch logs error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader title="Audit Logs" description="Complete activity log" />
      {loading ? (
        <p className="text-sm text-card-foreground/50">Loading…</p>
      ) : (
        <DataTable columns={columns} data={data} rowKey={(log) => log.id} />
      )}
    </div>
  );
}
