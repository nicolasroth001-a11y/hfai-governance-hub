import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { BarChart3, Eye, Users, Globe, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsData {
  pages: { route: string; views: number; unique: number }[];
  traffic: { date: string; views: number }[];
  referrers: { referrer: string; count: number }[];
  totalViews: number;
  uniqueSessions: number;
}

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: result, error: err } = await supabase.functions.invoke("analytics-data");
        if (err) throw err;
        setData(result);
      } catch (e: any) {
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <SectionHeader title={t("adminAnalytics.title")} description={t("adminAnalytics.description")} />
        <ContentCard title={t("adminAnalytics.error")}>
          <p className="text-sm text-destructive">{error || t("adminAnalytics.noData")}</p>
        </ContentCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader title={t("adminAnalytics.title")} description={t("adminAnalytics.description")} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{data.totalViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t("adminAnalytics.totalPageViews")}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{data.uniqueSessions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t("adminAnalytics.uniqueSessions")}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{data.pages.length}</p>
            <p className="text-xs text-muted-foreground">{t("adminAnalytics.pagesTracked")}</p>
          </div>
        </div>
      </div>

      <ContentCard icon={TrendingUp} title={t("adminAnalytics.trafficLast30")}>
        {data.traffic.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("adminAnalytics.noTraffic")}</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.traffic}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </ContentCard>

      <ContentCard icon={BarChart3} title={t("adminAnalytics.mostActivePages")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-medium text-muted-foreground">{t("adminAnalytics.page")}</th>
                <th className="py-2 pr-4 font-medium text-muted-foreground text-right">{t("adminAnalytics.views")}</th>
                <th className="py-2 font-medium text-muted-foreground text-right">{t("adminAnalytics.unique")}</th>
              </tr>
            </thead>
            <tbody>
              {data.pages.map((p) => (
                <tr key={p.route} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono text-xs text-card-foreground">{p.route}</td>
                  <td className="py-2 pr-4 text-right text-card-foreground">{p.views}</td>
                  <td className="py-2 text-right text-card-foreground">{p.unique}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>

      <ContentCard icon={Globe} title={t("adminAnalytics.topReferrers")}>
        {data.referrers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("adminAnalytics.noReferrers")}</p>
        ) : (
          <div className="space-y-2">
            {data.referrers.slice(0, 10).map((r) => (
              <div key={r.referrer} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-card-foreground truncate max-w-[70%]">{r.referrer}</span>
                <span className="text-xs font-medium text-muted-foreground">{r.count} {t("adminAnalytics.viewsSuffix")}</span>
              </div>
            ))}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
