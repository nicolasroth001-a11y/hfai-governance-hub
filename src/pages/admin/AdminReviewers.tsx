import { SectionHeader } from "@/components/SectionHeader";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAdminReviewers, deleteReviewer } from "@/lib/api";
import { UserPlus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function AdminReviewers() {
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviewers = () => {
    setLoading(true);
    fetchAdminReviewers()
      .then(setReviewers)
      .catch(() => setReviewers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReviewers(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this reviewer?")) return;
    try {
      await deleteReviewer(id);
      toast({ title: "Reviewer removed" });
      loadReviewers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const columns: DataTableColumn<any>[] = [
    { key: "name", header: "Name", render: (r) => <span className="text-sm font-medium text-card-foreground">{r.name || "—"}</span> },
    { key: "email", header: "Email", render: (r) => <span className="text-sm text-card-foreground/70">{r.email}</span> },
    { key: "role", header: "Role", render: (r) => <Badge variant="secondary" className="text-xs capitalize">{r.role}</Badge> },
    { key: "created_at", header: "Joined", render: (r) => <span className="text-xs text-card-foreground/50">{r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : "—"}</span> },
    { key: "actions", header: "", render: (r) => (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    )},
  ];

  return (
    <div className="space-y-section">
      <div className="flex items-end justify-between">
        <SectionHeader title="Reviewers" description="Manage HFAI human reviewers" />
        <Link to="/admin/reviewers/create">
          <Button size="sm" className="gap-2 h-9">
            <UserPlus className="h-3.5 w-3.5" /> Add Reviewer
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={reviewers} rowKey={(r) => r.id} loading={loading} emptyMessage="No reviewers found. Add one to get started." />
    </div>
  );
}