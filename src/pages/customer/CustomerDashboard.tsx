import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, CheckCircle, Send, ShieldAlert, Cpu, UserCheck } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { TestEventModal } from "@/components/TestEventModal";
import { fetchViolations, fetchAuditLogs, fetchAISystems, fetchReviews } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const RISK_COLORS: Record<string, string> = {
  low: "hsl(var(--success, 142 71% 45%))",
  medium: "hsl(var(--warning, 38 92% 50%))",
  high: "hsl(var(--destructive))",
  critical: "hsl(280 70% 50%)",
};

export default function CustomerDashboard() {
  const [stats, setStats] = useState({ totalViolations: 0, openViolations: 0, totalSystems: 0, pendingReviews: 0, resolvedToday: 0 });
  const [riskData, setRiskData] = useState<{ name: string; value: number }[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [testOpen, setTestOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [violations, logs, systems, reviews] = await Promise.all([
        fetchViolations(),
        fetchAuditLogs(),
        fetchAISystems(),
        fetchReviews(),
      ]);

      const pendingReviews = reviews.filter((r: any) => !r.decision || r.decision === "pending" || r.decision === "escalated").length;

      setStats({
        totalViolations: violations.length,
        openViolations: violations.filter((v: any) => v.status === "open").length,
        totalSystems: systems.length,
        pendingReviews,
        resolvedToday: violations.filter((v: any) => v.status === "resolved").length,
      });

      const riskCounts: Record<string, number> = {};
      systems.forEach((s: any) => {
        const level = s.risk_level || "medium";
        riskCounts[level] = (riskCounts[level] || 0) + 1;
      });
      setRiskData(Object.entries(riskCounts).map(([name, value]) => ({ name, value })));

      setActivity(logs.slice(0, 10).map((l: any) => ({
        id: l.id?.toString(),
        type: l.action?.includes("violation") ? "violation" : l.action?.includes("resolve") ? "resolution" : "review",
        message: l.details || l.action,
        timestamp: l.created_at || new Date().toISOString(),
      })));
    } catch {
      setStats({ totalViolations: 0, openViolations: 0, totalSystems: 0, pendingReviews: 0, resolvedToday: 0 });
      setActivity([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <SectionHeader title="Dashboard" description="Clarity and control over your AI governance" />
        <Button onClick={() => setTestOpen(true)} size="sm" className="gap-2 h-9">
          <Send className="h-3.5 w-3.5" /> Send Test Event
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="AI Systems" value={stats.totalSystems} icon={Cpu} />
        <StatCard title="Open Violations" value={stats.openViolations} icon={AlertTriangle} subtitle="Requires attention" />
        <StatCard title="Total Violations" value={stats.totalViolations} icon={ShieldAlert} />
        <StatCard title="Pending Reviews" value={stats.pendingReviews} icon={UserCheck} />
        <StatCard title="Resolved" value={stats.resolvedToday} icon={CheckCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard title="Risk Distribution">
          {riskData.length === 0 ? (
            <p className="text-sm text-card-foreground/50 py-8 text-center">No AI systems registered yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                  {riskData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name] || "hsl(var(--muted-foreground))"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ContentCard>

        <ContentCard title="Recent Activity">
          {loading ? (
            <p className="text-sm text-card-foreground/50">Loading…</p>
          ) : activity.length === 0 ? (
            <p className="text-sm text-card-foreground/50">No recent activity.</p>
          ) : (
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
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

      <TestEventModal open={testOpen} onOpenChange={setTestOpen} onEventSent={loadData} />
    </div>
  );
}
