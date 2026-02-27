import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Key } from "lucide-react";
import { fetchAISystems } from "@/lib/api";

const columns: DataTableColumn<any>[] = [
  { key: "id", header: "System ID", render: (r) => <span className="text-primary font-medium">{r.id}</span> },
  { key: "name", header: "Name", render: (r) => <span className="text-sm font-medium text-card-foreground">{r.name}</span> },
  { key: "api_key_hash", header: "API Key Hash", render: (r) => <span className="text-xs font-mono text-card-foreground/50 truncate max-w-[200px] block">{r.api_key_hash || "—"}</span> },
];

export default function AdminAPIKeys() {
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAISystems()
      .then(setSystems)
      .catch((err) => console.error("Fetch systems error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-section">
      <SectionHeader title="API Key Management" description="API keys are generated when AI systems are created. Keys are shown once and stored as hashes." />
      <ContentCard icon={Key} title="AI System Keys" fullWidth>
        {loading ? (
          <p className="text-sm text-card-foreground/50">Loading…</p>
        ) : (
          <DataTable columns={columns} data={systems} rowKey={(r) => r.id} emptyMessage="No AI systems found" />
        )}
      </ContentCard>
    </div>
  );
}
