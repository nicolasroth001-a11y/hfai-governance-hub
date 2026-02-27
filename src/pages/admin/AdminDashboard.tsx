import { useState, useEffect } from "react";
import { AlertTriangle, BookOpen, Users, Building2, ShieldAlert, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { mockAdminStats, mockRecentActivity } from "@/lib/mock-data";
import { fetchAdminStats, fetchRecentActivity } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const [stats, setStats] = useState(mockAdminStats);
  const [activity, setActivity] = useState(mockRecentActivity);

  useEffect(() => {
    fetchAdminStats().then(setStats).catch(() => {});
    fetchRecentActivity().then((logs) => {
      if (Array.isArray(logs) && logs.length > 0) {
        setActivity(logs.slice(0, 10).map((l: any) => ({
          id: l.id?.toString() || l.entity_id,
          type: l.action?.includes("violation") ? "violation" : l.action?.includes("resolve") ? "resolution" : "review",
          message: l.details || l.action,
          timestamp: l.created_at || l.timestamp || new Date().toISOString(),
        })));
      }
    }).catch(() => {});
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
      </ContentCard>
    </div>
  );
}
