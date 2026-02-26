import { useState } from "react";
import { AlertTriangle, BookOpen, CheckCircle, Send, ShieldAlert } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { TestEventModal } from "@/components/TestEventModal";
import { mockDashboardStats, mockRecentActivity } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";

export default function CustomerDashboard() {
  const stats = mockDashboardStats;
  const [testOpen, setTestOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <SectionHeader title="Your AI Systems" description="Clarity and control over your AI governance" />
        <Button onClick={() => setTestOpen(true)} size="sm" className="gap-2 h-9">
          <Send className="h-3.5 w-3.5" /> Send Test Event
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Violations" value={stats.totalViolations} icon={ShieldAlert} />
        <StatCard title="Open Violations" value={stats.openViolations} icon={AlertTriangle} subtitle="Requires attention" />
        <StatCard title="Active Rules" value={stats.totalRules} icon={BookOpen} />
        <StatCard title="Resolved Today" value={stats.resolvedToday} icon={CheckCircle} />
      </div>

      <TestEventModal open={testOpen} onOpenChange={setTestOpen} />

      <ContentCard title="Recent Activity">
        <div className="space-y-4">
          {mockRecentActivity.map((item) => (
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
