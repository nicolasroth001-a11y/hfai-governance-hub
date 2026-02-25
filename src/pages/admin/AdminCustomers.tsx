import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { mockCustomers } from "@/lib/mock-data";
import { format } from "date-fns";

type Customer = (typeof mockCustomers)[number];

const columns: DataTableColumn<Customer>[] = [
  { key: "id", header: "ID", render: (c) => <Link to={`/admin/customers/${c.id}`} className="text-primary font-medium hover:underline">{c.id}</Link> },
  { key: "name", header: "Organization", render: (c) => <span className="text-sm font-medium text-card-foreground">{c.name}</span> },
  { key: "email", header: "Email", render: (c) => <span className="text-xs text-card-foreground/60">{c.email}</span> },
  { key: "plan", header: "Plan", render: (c) => <span className="text-xs font-medium text-primary">{c.plan}</span> },
  { key: "models", header: "AI Models", render: (c) => <span className="text-sm text-card-foreground">{c.ai_models}</span> },
  { key: "violations", header: "Violations", render: (c) => <span className="text-sm text-card-foreground">{c.violations_total}</span> },
  { key: "joined", header: "Joined", render: (c) => <span className="text-xs text-card-foreground/50">{format(new Date(c.joined_at), "MMM d, yyyy")}</span> },
  { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
];

export default function AdminCustomers() {
  return (
    <div className="space-y-section">
      <SectionHeader title="Customers" description="Manage customer organizations" />
      <DataTable columns={columns} data={mockCustomers} rowKey={(c) => c.id} />
    </div>
  );
}
