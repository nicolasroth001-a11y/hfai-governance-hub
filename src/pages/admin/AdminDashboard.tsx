import { useState, useEffect } from "react";
import { AlertTriangle, BookOpen, Users, Building2, ShieldAlert, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { fetchViolations, fetchAuditLogs } from "@/lib/api";
import { mockAdminStats, mockRecentActivity } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalViolations: 0, awaitingReview: 0, totalCustomers: 0, totalReviewers: 0, totalRules: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [violations, logs] = await Promise.all([fetchViolations(), fetchAuditLogs()]);
        setStats({
          totalViolations: violations.length,
          awaitingReview: violations.filter((v: any) => v.status === "open" || v.status === "under_review").length,
          totalCustomers: 0,
          totalReviewers: 0,
          totalRules: 0,
        });
        setActivity(logs.slice(0, 10).map((l: any) => ({
          id: l.id?.toString(),
          type: l.action?.includes("violation") ? "violation" : l.action?.includes("resolve") ? "resolution" : "review",
          message: l.details || l.action,
          timestamp: l.created_at || new Date().toISOString(),
        })));
      } catch {
        setStats(mockAdminStats);
        setActivity(mockRecentActivity);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeader title="Platform Control" description="System-wide oversight and structure" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Violations" value={stats.totalViolations} icon={ShieldAlert} />
        <StatCard title="Awaiting Review" value={stats.awaitingReview} icon={Clock} subtitle="Needs attention" />
        <StatCard title="Customers" value={stats.totalCustomers} icon={Building2} />
        <StatCard title="Reviewers" value={stats.totalReviewers} icon={Users} />
        <StatCard title="Active Rules" value={stats.totalRules} icon={BookOpen} />
      </div>

      <ContentCard title="Recent System Activity">
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
  );
}
