import { useState, useEffect } from "react";
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
        <SectionHeader title="Analytics" description="Site-wide traffic analytics" />
        <ContentCard title="Error">
          <p className="text-sm text-destructive">{error || "No data available"}</p>
        </ContentCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Analytics" description="Site-wide traffic analytics — admin only" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{data.totalViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Page Views</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{data.uniqueSessions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Unique Sessions</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{data.pages.length}</p>
            <p className="text-xs text-muted-foreground">Pages Tracked</p>
          </div>
        </div>
      </div>

      <ContentCard icon={TrendingUp} title="Traffic (Last 30 Days)">
        {data.traffic.length === 0 ? (
          <p className="text-sm text-muted-foreground">No traffic data yet.</p>
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

      <ContentCard icon={BarChart3} title="Most Active Pages">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-medium text-muted-foreground">Page</th>
                <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Views</th>
                <th className="py-2 font-medium text-muted-foreground text-right">Unique</th>
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

      <ContentCard icon={Globe} title="Top Referrers">
        {data.referrers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No referrer data yet.</p>
        ) : (
          <div className="space-y-2">
            {data.referrers.slice(0, 10).map((r) => (
              <div key={r.referrer} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-card-foreground truncate max-w-[70%]">{r.referrer}</span>
                <span className="text-xs font-medium text-muted-foreground">{r.count} views</span>
              </div>
            ))}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
