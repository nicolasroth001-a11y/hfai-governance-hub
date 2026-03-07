import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { fetchReviews } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const columns: DataTableColumn<any>[] = [
  {
    key: "decision", header: "Decision", render: (r) => (
      <Badge
        variant={r.decision === "approved" ? "default" : r.decision === "rejected" ? "destructive" : "secondary"}
        className="capitalize text-xs"
      >
        {r.decision || "pending"}
      </Badge>
    ),
  },
  { key: "violation_id", header: "Violation", render: (r) => <span className="text-xs font-mono text-card-foreground/60">{r.violation_id?.slice(0, 8)}</span> },
  { key: "reviewer_name", header: "Reviewer", render: (r) => <span className="text-sm text-card-foreground">{r.reviewer_name || "—"}</span> },
  { key: "comments", header: "Notes", render: (r) => <span className="text-sm text-card-foreground/60 line-clamp-1 max-w-xs">{r.comments || "—"}</span> },
  { key: "created_at", header: "Reviewed", render: (r) => <span className="text-xs text-card-foreground/50">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span> },
];

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews()
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = reviews.filter((r) => !r.decision || r.decision === "pending" || r.decision === "escalated");
  const completed = reviews.filter((r) => r.decision === "approved" || r.decision === "rejected");

  return (
    <SubscriptionGate feature="Human Reviews">
      <div className="space-y-section">
        <SectionHeader title="Human Reviews" description="Decisions made by human reviewers on flagged violations" />

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
            <TabsTrigger value="all">All ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <DataTable columns={columns} data={pending} rowKey={(r) => r.id} loading={loading} emptyMessage="No pending reviews" />
          </TabsContent>

          <TabsContent value="completed">
            <DataTable columns={columns} data={completed} rowKey={(r) => r.id} loading={loading} emptyMessage="No completed reviews" />
          </TabsContent>

          <TabsContent value="all">
            <DataTable columns={columns} data={reviews} rowKey={(r) => r.id} loading={loading} emptyMessage="No reviews yet" />
          </TabsContent>
        </Tabs>
      </div>
    </SubscriptionGate>
  );
}
