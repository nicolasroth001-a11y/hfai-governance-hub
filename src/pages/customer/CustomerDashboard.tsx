import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, Send, ShieldAlert, Cpu, UserCheck, Plug, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { ComplianceScore } from "@/components/ComplianceScore";
import { Button } from "@/components/ui/button";
import { TestEventModal } from "@/components/TestEventModal";
import { LiveEventFeed } from "@/components/LiveEventFeed";
import { RealtimeStats } from "@/components/RealtimeStats";
import { OnboardingWelcome } from "@/components/OnboardingWelcome";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { fetchViolations, fetchAuditLogs, fetchAISystems, fetchReviews } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const RISK_COLORS: Record<string, string> = {
  low: "hsl(var(--success, 142 71% 45%))",
  medium: "hsl(var(--warning, 38 92% 50%))",
  high: "hsl(var(--destructive))",
  critical: "hsl(280 70% 50%)",
};

const REALTIME_TABLES = ["violations", "ai_events", "audit_logs"];

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ totalViolations: 0, openViolations: 0, totalSystems: 0, pendingReviews: 0, resolvedToday: 0 });
  const [riskData, setRiskData] = useState<{ name: string; value: number }[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [testOpen, setTestOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { completedAt, progress: onboardingProgress, loading: onboardingLoading } = useOnboardingProgress();

  const handleRealtimeEvent = useCallback(() => {
    loadData();
  }, []);
  const { connected, events, clearEvents } = useRealtimeSubscription({
    tables: REALTIME_TABLES,
    onEvent: handleRealtimeEvent,
  });

  useEffect(() => {
    if (onboardingLoading) {
      const timeout = setTimeout(() => {}, 5000);
      return () => clearTimeout(timeout);
    }
  }, [onboardingLoading]);

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

  const isNewUser = !onboardingLoading && !completedAt && onboardingProgress === 0;
  if (isNewUser) {
    return <OnboardingWelcome />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <SectionHeader title={t("customerDashboard.title")} description={t("customerDashboard.description")} />
        <Button onClick={() => setTestOpen(true)} size="sm" className="gap-2 h-9 w-full sm:w-auto">
          <Send className="h-3.5 w-3.5" /> {t("customerDashboard.sendTestEvent")}
        </Button>
      </div>

      {/* Compliance Score — the #1 thing a user wants to know */}
      <ComplianceScore
        totalSystems={stats.totalSystems}
        openViolations={stats.openViolations}
        resolvedViolations={stats.resolvedToday}
        totalViolations={stats.totalViolations}
      />

      <RealtimeStats events={events} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <StatCard title={t("customerDashboard.aiSystems")} value={stats.totalSystems} icon={Cpu} />
        <StatCard title={t("customerDashboard.openViolations")} value={stats.openViolations} icon={AlertTriangle} subtitle={t("customerDashboard.requiresAttention")} />
        <StatCard title={t("customerDashboard.totalViolations")} value={stats.totalViolations} icon={ShieldAlert} />
        <StatCard title={t("customerDashboard.pendingReviews")} value={stats.pendingReviews} icon={UserCheck} />
        <StatCard title={t("customerDashboard.resolved")} value={stats.resolvedToday} icon={CheckCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <LiveEventFeed events={events} connected={connected} onClear={clearEvents} />

        <ContentCard title={t("customerDashboard.riskDistribution")}>
          {riskData.length === 0 ? (
            <p className="text-sm text-card-foreground/50 py-8 text-center">{t("customerDashboard.noSystemsYet")}</p>
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
      </div>

      <ContentCard title={t("customerDashboard.recentActivity")}>
        {loading ? (
          <p className="text-sm text-card-foreground/50">{t("customerDashboard.loading")}</p>
        ) : activity.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <BookOpen className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-card-foreground/60 max-w-xs text-center">
              No activity yet. Connect an AI system and send your first event to see governance activity here.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link to="/customer/connect"><Plug className="h-3.5 w-3.5" /> Connect</Link>
              </Button>
              <Button size="sm" onClick={() => setTestOpen(true)} className="gap-2">
                <Send className="h-3.5 w-3.5" /> Send Test Event
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                  item.type === "violation" ? "bg-destructive" : item.type === "resolution" ? "bg-success" : "bg-primary"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-card-foreground line-clamp-2">{item.message}</p>
                  <p className="text-[11px] text-card-foreground/35 mt-0.5">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>

      <TestEventModal open={testOpen} onOpenChange={setTestOpen} onEventSent={loadData} />
    </div>
  );
}
