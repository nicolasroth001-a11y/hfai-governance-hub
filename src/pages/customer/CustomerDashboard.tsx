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
  const [stats, setStats] = useState({ totalViolations: 47, openViolations: 3, totalSystems: 12, pendingReviews: 5, resolvedToday: 39 });
  const [riskData, setRiskData] = useState<{ name: string; value: number }[]>([
    { name: "low", value: 7 },
    { name: "medium", value: 3 },
    { name: "high", value: 2 },
  ]);
  const [activity, setActivity] = useState<any[]>([
    { id: "1", type: "violation", message: "Bias detected in GPT-4 hiring recommendation output", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: "2", type: "resolution", message: "Content filter violation resolved by reviewer", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: "3", type: "review", message: "Human review completed for sentiment analysis model", timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
    { id: "4", type: "violation", message: "PII exposure flagged in customer support chatbot", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
    { id: "5", type: "resolution", message: "Toxicity threshold breach resolved — model retrained", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  ]);
  const [testOpen, setTestOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    // mock data mode — skip API
  }, []);

  useEffect(() => { }, []);

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
