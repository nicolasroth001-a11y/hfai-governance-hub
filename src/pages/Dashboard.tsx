import { AlertTriangle, BookOpen, CheckCircle, ShieldAlert } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Timeline } from "@/components/Timeline";
import { mockDashboardStats, mockRecentActivity } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const stats = mockDashboardStats;
  const activity = mockRecentActivity;

  return (
    <div className="space-y-section">
      <SectionHeader title="Dashboard" description="AI governance overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-base">
        <StatCard title="Total Violations" value={stats.totalViolations} icon={ShieldAlert} />
        <StatCard title="Open Violations" value={stats.openViolations} icon={AlertTriangle} subtitle="Requires attention" />
        <StatCard title="Active Rules" value={stats.totalRules} icon={BookOpen} />
        <StatCard title="Resolved Today" value={stats.resolvedToday} icon={CheckCircle} />
      </div>

      <ContentCard title="Recent Activity">
        <div className="space-y-4">
          {activity.map((item) => (
            <div key={item.id} className="flex items-start gap-3 animate-fade-in">
              <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                item.type === "violation" ? "bg-destructive" : item.type === "resolution" ? "bg-success" : "bg-primary"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-card-foreground">{item.message}</p>
                <p className="text-xs text-card-foreground/50 mt-0.5">
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
