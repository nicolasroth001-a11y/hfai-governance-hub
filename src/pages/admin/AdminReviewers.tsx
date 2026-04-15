import { SectionHeader } from "@/components/SectionHeader";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAdminReviewers, deleteReviewer } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Trash2, Shield, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function AdminReviewers() {
  const { t } = useTranslation();
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [permMap, setPermMap] = useState<Record<string, any>>({});

  const loadReviewers = () => {
    setLoading(true);
    Promise.all([
      fetchAdminReviewers(),
      supabase.from("reviewer_permissions" as any).select("*"),
    ])
      .then(([revs, { data: perms }]) => {
        setReviewers(revs);
        const map: Record<string, any> = {};
        for (const p of perms ?? []) map[(p as any).reviewer_id] = p;
        setPermMap(map);
      })
      .catch(() => setReviewers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReviewers(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t("adminReviewers.confirmDelete"))) return;
    try {
      await deleteReviewer(id);
      toast({ title: t("adminReviewers.reviewerRemoved") });
      loadReviewers();
    } catch (err: any) {
      toast({ title: t("adminReviewers.error"), description: err.message, variant: "destructive" });
    }
  };

  const columns: DataTableColumn<any>[] = [
    { key: "name", header: t("adminReviewers.name"), render: (r) => (
      <div className="flex items-center gap-2">
        {permMap[r.id]?.reviewer_type === "hfai_appointed" ? (
          <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
        ) : (
          <Shield className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        )}
        <span className="text-sm font-medium text-card-foreground">{r.name || "—"}</span>
      </div>
    )},
    { key: "email", header: t("adminReviewers.email"), render: (r) => <span className="text-sm text-card-foreground/70">{r.email}</span> },
    { key: "type", header: "Type", render: (r) => {
      const perm = permMap[r.id];
      if (!perm) return <Badge variant="secondary" className="text-[10px]">Unassigned</Badge>;
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={perm.reviewer_type === "hfai_appointed" ? "default" : "secondary"} className="text-[10px]">
            {perm.reviewer_type === "hfai_appointed" ? "HFAI" : "Company"}
          </Badge>
          {perm.is_backup_reviewer && (
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Backup</Badge>
          )}
          {perm.can_override_decisions && (
            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">Override</Badge>
          )}
        </div>
      );
    }},
    { key: "created_at", header: t("adminReviewers.joined"), render: (r) => <span className="text-xs text-card-foreground/50">{r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : "—"}</span> },
    { key: "actions", header: "", render: (r) => (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    )},
  ];

  return (
    <div className="space-y-section">
      <div className="flex items-end justify-between">
        <SectionHeader title={t("adminReviewers.title")} description={t("adminReviewers.description")} />
        <Link to="/admin/reviewers/create">
          <Button size="sm" className="gap-2 h-9">
            <UserPlus className="h-3.5 w-3.5" /> {t("adminReviewers.addReviewer")}
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={reviewers} rowKey={(r) => r.id} loading={loading} emptyMessage={t("adminReviewers.noReviewers")} />
    </div>
  );
}
