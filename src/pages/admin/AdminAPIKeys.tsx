import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { APIKeyDisplay } from "@/components/APIKeyDisplay";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Key } from "lucide-react";
import { mockCustomers } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

interface APIKeyRow {
  customer_id: string;
  customer_name: string;
  api_key: string;
}

const mockAPIKeys: APIKeyRow[] = mockCustomers.map((c) => ({
  customer_id: c.id,
  customer_name: c.name,
  api_key: `hfai_live_sk_${c.id.toLowerCase().replace("-", "")}_${"abcdefghijklmnop".slice(0, 16)}`,
}));

const columns: DataTableColumn<APIKeyRow>[] = [
  { key: "customer_id", header: "Customer ID", render: (r) => <span className="text-primary font-medium">{r.customer_id}</span> },
  { key: "customer_name", header: "Organization", render: (r) => <span className="text-sm font-medium text-card-foreground">{r.customer_name}</span> },
  { key: "api_key", header: "API Key", render: (r) => (
    <APIKeyDisplay
      apiKey={r.api_key}
      onRegenerate={() => {
        fetch(`http://localhost:4000/api-keys/${r.customer_id}/regenerate`, { method: "POST" }).catch(() => {});
        toast({ title: "Key regenerated", description: `New key issued for ${r.customer_name}.` });
      }}
    />
  )},
];

export default function AdminAPIKeys() {
  return (
    <div className="space-y-section">
      <SectionHeader title="API Key Management" description="View and manage customer API keys" />
      <ContentCard icon={Key} title="Customer API Keys" fullWidth>
        <DataTable columns={columns} data={mockAPIKeys} rowKey={(r) => r.customer_id} />
      </ContentCard>
    </div>
  );
}
