import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Plug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminAPIKeys() {
  const { t } = useTranslation();
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

  const columns: DataTableColumn<any>[] = [
    { key: "org_name", header: t("adminAPIKeys.organization"), render: (r) => <span className="text-sm font-medium text-card-foreground">{r.org_name || "—"}</span> },
    { key: "provider", header: t("adminAPIKeys.provider"), render: (r) => <span className="text-primary font-medium capitalize">{r.provider}</span> },
    { key: "status", header: t("adminAPIKeys.status"), render: (r) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
        {r.status}
      </span>
    )},
    { key: "created_at", header: t("adminAPIKeys.connected"), render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-section">
      <SectionHeader title={t("adminAPIKeys.title")} description={t("adminAPIKeys.description")} />
      <ContentCard icon={Plug} title={t("adminAPIKeys.activeConnections")} fullWidth>
        {loading ? (
          <p className="text-sm text-card-foreground/50">{t("adminAPIKeys.loading")}</p>
        ) : (
          <DataTable columns={columns} data={connections} rowKey={(r) => r.id} emptyMessage={t("adminAPIKeys.noProviders")} />
        )}
      </ContentCard>
    </div>
  );
}
