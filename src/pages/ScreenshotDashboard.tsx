import { AlertTriangle, CheckCircle, Send, ShieldAlert, Cpu, UserCheck } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { RoleSidebar, type NavItem } from "@/components/RoleSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Globe, Zap, AlertTriangle as AT2, Users, BookOpen, FileText, ClipboardList, Settings } from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  low: "hsl(142, 71%, 45%)",
  medium: "hsl(38, 92%, 50%)",
  high: "hsl(0, 84%, 60%)",
};

const riskData = [
  { name: "low", value: 7 },
  { name: "medium", value: 3 },
  { name: "high", value: 2 },
];

const activity = [
  { id: "1", type: "violation", message: "Bias detected in GPT-4 hiring recommendation output", time: "about 2 hours ago" },
  { id: "2", type: "resolution", message: "Content filter violation resolved by reviewer", time: "about 5 hours ago" },
  { id: "3", type: "review", message: "Human review completed for sentiment analysis model", time: "about 9 hours ago" },
  { id: "4", type: "violation", message: "PII exposure flagged in customer support chatbot", time: "about 13 hours ago" },
  { id: "5", type: "resolution", message: "Toxicity threshold breach resolved — model retrained", time: "1 day ago" },
];

const navItems: NavItem[] = [
  { title: "Dashboard", url: "#", icon: LayoutDashboard },
  { title: "AI Systems", url: "#", icon: Globe },
  { title: "Events", url: "#", icon: Zap },
  { title: "Violations", url: "#", icon: AT2 },
  { title: "Human Reviews", url: "#", icon: Users },
  { title: "Rules", url: "#", icon: BookOpen },
  { title: "Rule Templates", url: "#", icon: FileText },
  { title: "Audit Logs", url: "#", icon: ClipboardList },
  { title: "Onboarding", url: "#", icon: Settings },
];

export default function ScreenshotDashboard() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleSidebar items={navItems} roleLabel="Customer Portal" roleDescription="" />
        <main className="flex-1 overflow-auto">
          <header className="h-14 flex items-center justify-end border-b border-border/40 px-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>customer@hfai.io</span>
              <span className="flex items-center gap-1 cursor-pointer">↪ Log out</span>
            </div>
          </header>
          <div className="px-8 py-8 max-w-6xl mx-auto space-y-8">
            <div className="flex items-end justify-between">
              <SectionHeader title="Dashboard" description="Clarity and control over your AI governance" />
              <Button size="sm" className="gap-2 h-9">
                <Send className="h-3.5 w-3.5" /> Send Test Event
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard title="AI Systems" value={12} icon={Cpu} />
              <StatCard title="Open Violations" value={3} icon={AlertTriangle} subtitle="Requires attention" />
              <StatCard title="Total Violations" value={47} icon={ShieldAlert} />
              <StatCard title="Pending Reviews" value={5} icon={UserCheck} />
              <StatCard title="Resolved" value={39} icon={CheckCircle} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContentCard title="Risk Distribution">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={riskData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                      {riskData.map((entry) => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ContentCard>

              <ContentCard title="Recent Activity">
                <div className="space-y-4">
                  {activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                        item.type === "violation" ? "bg-destructive" : item.type === "resolution" ? "bg-success" : "bg-primary"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-body text-card-foreground">{item.message}</p>
                        <p className="text-[11px] text-card-foreground/35 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ContentCard>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
