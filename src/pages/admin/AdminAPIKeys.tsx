import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Plug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const columns: DataTableColumn<any>[] = [
  { key: "org_name", header: "Organization", render: (r) => <span className="text-sm font-medium text-card-foreground">{r.org_name || "—"}</span> },
  { key: "provider", header: "Provider", render: (r) => <span className="text-primary font-medium capitalize">{r.provider}</span> },
  { key: "status", header: "Status", render: (r) => (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
      {r.status}
    </span>
  )},
  { key: "created_at", header: "Connected", render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span> },
];

export default function AdminAPIKeys() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("connected_providers" as any)
        .select("*, organizations(name)")
        .order("created_at", { ascending: false });

      const rows = (data || []).map((row: any) => ({
        ...row,
        org_name: row.organizations?.name || "—",
      }));
      setConnections(rows);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-section">
      <SectionHeader title="Provider Connections" description="Connected AI providers across all customer organizations." />
      <ContentCard icon={Plug} title="Active Connections" fullWidth>
        {loading ? (
          <p className="text-sm text-card-foreground/50">Loading…</p>
        ) : (
          <DataTable columns={columns} data={connections} rowKey={(r) => r.id} emptyMessage="No providers connected yet" />
        )}
      </ContentCard>
    </div>
  );
}
