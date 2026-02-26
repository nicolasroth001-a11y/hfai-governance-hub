import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { SeverityBadge } from "@/components/SeverityBadge";
import { mockRules } from "@/lib/mock-data";

type Rule = (typeof mockRules)[number];

const columns: DataTableColumn<Rule>[] = [
  { key: "id", header: "ID", render: (r) => <Link to={`/customer/rules/${r.id}`} className="text-primary font-medium hover:underline">{r.id}</Link> },
  { key: "name", header: "Name", render: (r) => <span className="text-sm font-medium text-card-foreground">{r.name}</span> },
  { key: "category", header: "Category", render: (r) => <span className="text-xs text-card-foreground/60">{r.category}</span> },
  { key: "severity", header: "Severity", render: (r) => <SeverityBadge severity={r.severity_default} /> },
  { key: "violations", header: "Violations", render: (r) => <span className="text-sm text-card-foreground">{r.violations_count}</span> },
];

export default function CustomerRules() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Rules" description="AI governance rules applied to your systems" />
      <DataTable columns={columns} data={mockRules} rowKey={(r) => r.id} />
    </div>
  );
}
