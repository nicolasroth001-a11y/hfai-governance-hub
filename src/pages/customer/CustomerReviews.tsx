import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { fetchReviews } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ShieldAlert } from "lucide-react";

export default function CustomerReviews() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<any[]>([]);
  const [overrides, setOverrides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchReviews(),
      supabase.from("reviewer_overrides" as any).select("*").order("created_at", { ascending: false }),
    ])
      .then(([revs, { data: ovr }]) => {
        setReviews(revs);
        setOverrides((ovr ?? []) as any);
      })
      .catch(() => { setReviews([]); setOverrides([]); })
      .finally(() => setLoading(false));
  }, []);

  // Map overrides by violation_id for quick lookup
  const overrideMap = new Map<string, any>();
  for (const o of overrides) overrideMap.set(o.violation_id, o);

  const columns: DataTableColumn<any>[] = [
    {
      key: "decision", header: t("customerReviews.decision"), render: (r) => {
        const override = overrideMap.get(r.violation_id);
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant={r.decision === "approved" ? "default" : r.decision === "rejected" ? "destructive" : "secondary"} className="capitalize text-xs">
              {r.decision || "pending"}
            </Badge>
            {override && (
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 gap-1">
                <ShieldAlert className="h-2.5 w-2.5" />
                Overridden
              </Badge>
            )}
          </div>
        );
      },
    },
    { key: "violation_id", header: t("customerReviews.violation"), render: (r) => <span className="text-xs font-mono text-card-foreground/60">{r.violation_id?.slice(0, 8)}</span> },
    { key: "reviewer_name", header: t("customerReviews.reviewer"), render: (r) => <span className="text-sm text-card-foreground">{r.reviewer_name || "—"}</span> },
    { key: "comments", header: t("customerReviews.notes"), render: (r) => <span className="text-sm text-card-foreground/60 line-clamp-1 max-w-xs">{r.comments || "—"}</span> },
    { key: "created_at", header: t("customerReviews.reviewed"), render: (r) => <span className="text-xs text-card-foreground/50">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span> },
  ];

  const pending = reviews.filter((r) => !r.decision || r.decision === "pending" || r.decision === "escalated");
  const completed = reviews.filter((r) => r.decision === "approved" || r.decision === "rejected");

  return (
    <SubscriptionGate feature="Human Reviews">
      <div className="space-y-section">
        <SectionHeader title={t("customerReviews.title")} description={t("customerReviews.description")} />

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">{t("customerReviews.pending")} ({pending.length})</TabsTrigger>
            <TabsTrigger value="completed">{t("customerReviews.completed")} ({completed.length})</TabsTrigger>
            <TabsTrigger value="all">{t("customerReviews.all")} ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <DataTable columns={columns} data={pending} rowKey={(r) => r.id} loading={loading} emptyMessage={t("customerReviews.noPending")} />
          </TabsContent>
          <TabsContent value="completed">
            <DataTable columns={columns} data={completed} rowKey={(r) => r.id} loading={loading} emptyMessage={t("customerReviews.noCompleted")} />
          </TabsContent>
          <TabsContent value="all">
            <DataTable columns={columns} data={reviews} rowKey={(r) => r.id} loading={loading} emptyMessage={t("customerReviews.noReviews")} />
          </TabsContent>
        </Tabs>
      </div>
    </SubscriptionGate>
  );
}
