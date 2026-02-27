import { useState, useEffect } from "react";
import { AlertTriangle, BookOpen, CheckCircle, ShieldAlert } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { fetchViolations, fetchAuditLogs } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalViolations: 0, openViolations: 0, totalRules: 0, resolvedToday: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [violations, logs] = await Promise.all([fetchViolations(), fetchAuditLogs()]);
        setStats({
          totalViolations: violations.length,
          openViolations: violations.filter((v: any) => v.status === "open").length,
          totalRules: 0,
          resolvedToday: violations.filter((v: any) => v.status === "resolved").length,
        });
        setActivity(logs.slice(0, 10).map((l: any) => ({
          id: l.id?.toString(),
          type: l.action?.includes("violation") ? "violation" : l.action?.includes("resolve") ? "resolution" : "review",
          message: l.details || l.action,
          timestamp: l.created_at || new Date().toISOString(),
        })));
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeader title="Dashboard" description="AI governance overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Violations" value={stats.totalViolations} icon={ShieldAlert} />
        <StatCard title="Open Violations" value={stats.openViolations} icon={AlertTriangle} subtitle="Requires attention" />
        <StatCard title="Active Rules" value={stats.totalRules} icon={BookOpen} />
        <StatCard title="Resolved Today" value={stats.resolvedToday} icon={CheckCircle} />
      </div>

      <ContentCard title="Recent Activity">
        {loading ? (
          <p className="text-sm text-card-foreground/50">Loading…</p>
        ) : activity.length === 0 ? (
          <p className="text-sm text-card-foreground/50">No recent activity.</p>
        ) : (
          <div className="space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 animate-fade-in">
                <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                  item.type === "violation" ? "bg-destructive" : item.type === "resolution" ? "bg-success" : "bg-primary"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-body text-card-foreground">{item.message}</p>
                  <p className="text-[11px] text-card-foreground/35 mt-0.5">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
