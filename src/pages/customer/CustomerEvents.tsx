import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { Badge } from "@/components/ui/badge";
import { fetchAIEvents } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const columns: DataTableColumn<any>[] = [
  { key: "id", header: "ID", render: (e) => <Link to={`/customer/events/${e.id}`} className="text-primary font-medium hover:underline text-xs font-mono">{e.id.slice(0, 8)}</Link> },
  { key: "event_type", header: "Type", render: (e) => <Badge variant="outline" className="text-xs capitalize">{e.event_type}</Badge> },
  { key: "input_text", header: "Input", render: (e) => <span className="text-sm text-card-foreground line-clamp-1 max-w-xs">{e.input_text || (typeof e.payload === "string" ? e.payload : "—")}</span> },
  { key: "output_text", header: "Output", render: (e) => <span className="text-sm text-card-foreground/60 line-clamp-1 max-w-xs">{e.output_text || "—"}</span> },
  { key: "created_at", header: "Time", render: (e) => <span className="text-xs text-card-foreground/50">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</span> },
];

export default function CustomerEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchAIEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const types = [...new Set(events.map((e) => e.event_type))];
  const filtered = typeFilter === "all" ? events : events.filter((e) => e.event_type === typeFilter);

  return (
    <div className="space-y-section">
      <SectionHeader title="AI Events" description="All events from your AI systems" />
      <FilterBar filters={[
        { key: "type", label: "Event Type", value: typeFilter, onChange: setTypeFilter, options: types.map((t) => ({ label: t, value: t })) },
      ]} />
      {loading ? (
        <p className="text-sm text-card-foreground/50">Loading…</p>
      ) : (
        <DataTable columns={columns} data={filtered} rowKey={(e) => e.id} emptyMessage="No events recorded yet" />
      )}
    </div>
  );
}
