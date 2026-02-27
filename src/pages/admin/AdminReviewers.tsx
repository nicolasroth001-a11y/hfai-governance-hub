import { SectionHeader } from "@/components/SectionHeader";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { fetchReviews } from "@/lib/api";

const columns: DataTableColumn<any>[] = [
  { key: "id", header: "ID", render: (r) => <span className="text-primary font-medium">{r.id}</span> },
  { key: "reviewer_name", header: "Reviewer", render: (r) => <span className="text-sm text-card-foreground">{r.reviewer_name}</span> },
  { key: "violation_id", header: "Violation", render: (r) => <span className="text-xs font-mono text-card-foreground/60">{r.violation_id}</span> },
  { key: "decision", header: "Decision", render: (r) => <span className="text-xs text-card-foreground/60">{r.decision}</span> },
];

export default function AdminReviewers() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews()
      .then(setReviews)
      .catch((err) => console.error("Fetch reviews error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-section">
      <SectionHeader title="Reviewers" description="Human reviews submitted (no dedicated reviewers route in backend)" />
      {loading ? (
        <p className="text-sm text-card-foreground/50">Loading…</p>
      ) : (
        <DataTable columns={columns} data={reviews} rowKey={(r) => r.id} emptyMessage="No reviews found" />
      )}
    </div>
  );
}
