import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { mockReviewers } from "@/lib/mock-data";

type Reviewer = (typeof mockReviewers)[number];

const columns: DataTableColumn<Reviewer>[] = [
  { key: "id", header: "ID", render: (r) => <Link to={`/admin/reviewers/${r.id}`} className="text-primary font-medium hover:underline">{r.id}</Link> },
  { key: "name", header: "Name", render: (r) => <span className="text-sm font-medium text-card-foreground">{r.name}</span> },
  { key: "email", header: "Email", render: (r) => <span className="text-xs text-card-foreground/60">{r.email}</span> },
  { key: "role", header: "Role", render: (r) => <span className="text-xs text-card-foreground/60">{r.role}</span> },
  { key: "assigned", header: "Assigned", render: (r) => <span className="text-sm text-card-foreground">{r.assigned_violations}</span> },
  { key: "reviewed", header: "Reviewed", render: (r) => <span className="text-sm text-card-foreground">{r.reviewed_total}</span> },
  { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
];

export default function AdminReviewers() {
  return (
    <div className="space-y-section">
      <SectionHeader title="Reviewers" description="Manage human reviewers" />
      <DataTable columns={columns} data={mockReviewers} rowKey={(r) => r.id} />
    </div>
  );
}
