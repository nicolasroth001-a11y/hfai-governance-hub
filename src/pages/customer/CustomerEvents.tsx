import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { Badge } from "@/components/ui/badge";
import { fetchAIEvents, fetchAISystems } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function CustomerEvents() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [systemFilter, setSystemFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      fetchAIEvents().catch(() => []),
      fetchAISystems().catch(() => []),
    ]).then(([evts, syss]) => {
      setEvents(evts);
      setSystems(syss);
    }).finally(() => setLoading(false));
  }, []);

  const columns: DataTableColumn<any>[] = [
    { key: "id", header: t("customerEvents.id"), render: (e) => <Link to={`/customer/events/${e.id}`} className="text-primary font-medium hover:underline text-xs font-mono">{e.id.slice(0, 8)}</Link> },
    { key: "event_type", header: t("customerEvents.type"), render: (e) => <Badge variant="outline" className="text-xs capitalize">{e.event_type}</Badge> },
    { key: "ai_system_id", header: t("customerEvents.system"), render: (e) => <span className="text-xs text-card-foreground/60 font-mono">{e.ai_system_id ? e.ai_system_id.slice(0, 8) : "—"}</span> },
    { key: "input_text", header: t("customerEvents.input"), render: (e) => <span className="text-sm text-card-foreground line-clamp-1 max-w-xs">{e.input_text || (typeof e.payload === "string" ? e.payload : "—")}</span> },
    { key: "output_text", header: t("customerEvents.output"), render: (e) => <span className="text-sm text-card-foreground/60 line-clamp-1 max-w-xs">{e.output_text || "—"}</span> },
    { key: "created_at", header: t("customerEvents.time"), render: (e) => <span className="text-xs text-card-foreground/50">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</span> },
  ];

  const types = [...new Set(events.map((e) => e.event_type))];
  const filtered = events.filter((e) =>
    (typeFilter === "all" || e.event_type === typeFilter) &&
    (systemFilter === "all" || e.ai_system_id === systemFilter)
  );

  return (
    <div className="space-y-section">
      <SectionHeader title={t("customerEvents.title")} description={t("customerEvents.description")} />
      <FilterBar filters={[
        { key: "type", label: t("customerEvents.eventType"), value: typeFilter, onChange: setTypeFilter, options: types.map((tp) => ({ label: tp, value: tp })) },
        { key: "system", label: t("customerEvents.aiSystem"), value: systemFilter, onChange: setSystemFilter, options: systems.map((s) => ({ label: s.name, value: s.id })) },
      ]} />
      <DataTable columns={columns} data={filtered} rowKey={(e) => e.id} loading={loading} emptyMessage={t("customerEvents.noEvents")} />
    </div>
  );
}
