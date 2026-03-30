import { Outlet } from "react-router-dom";
import { RoleSidebar, NavItem } from "@/components/RoleSidebar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutDashboard, AlertTriangle, BookOpen, ClipboardList, Rocket, Cpu, FileText, Activity, UserCheck, Bell, ShieldCheck, Plug, Scale, PenSquare, Award, TrendingUp, Brain, Globe, ClipboardCheck, BarChart3, GitBranch, CalendarClock, Building2, Database } from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/customer/dashboard", icon: LayoutDashboard },
  { title: "AI Systems", url: "/customer/ai-systems", icon: Cpu },
  { title: "Deployment Readiness", url: "/customer/deployment-readiness", icon: ClipboardCheck },
  { title: "Events", url: "/customer/events", icon: Activity },
  { title: "Violations", url: "/customer/violations", icon: AlertTriangle },
  { title: "Human Reviews", url: "/customer/reviews", icon: UserCheck },
  { title: "Rules", url: "/customer/rules", icon: BookOpen },
  { title: "Rule Templates", url: "/customer/rule-templates", icon: FileText },
  { title: "Bias Auditing", url: "/customer/bias-auditing", icon: BarChart3 },
  { title: "Model Versions", url: "/customer/model-versions", icon: GitBranch },
  { title: "Scheduled Audits", url: "/customer/scheduled-audits", icon: CalendarClock },
  { title: "Vendor Risk", url: "/customer/vendor-risk", icon: Building2 },
  { title: "Data Lineage", url: "/customer/data-lineage", icon: Database },
  { title: "EU Compliance", url: "/customer/compliance", icon: Scale },
  { title: "Certificates", url: "/customer/certificates", icon: Award },
  { title: "Drift Detection", url: "/customer/drift-detection", icon: TrendingUp },
  { title: "Precedent Intel", url: "/customer/precedent-intelligence", icon: Brain },
  { title: "Multi-Jurisdiction", url: "/customer/multi-jurisdiction", icon: Globe },
  { title: "Notifications", url: "/customer/notifications", icon: Bell },
  { title: "Audit Logs", url: "/customer/logs", icon: ClipboardList },
  { title: "Auto-Connect", url: "/customer/connect", icon: Plug },
  { title: "Submit Blog Post", url: "/customer/blog-submit", icon: PenSquare },
  { title: "Security", url: "/customer/security", icon: ShieldCheck },
  { title: "Onboarding", url: "/customer/onboarding", icon: Rocket },
];

export default function CustomerLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleSidebar items={navItems} roleLabel="HFAI" roleDescription="Customer Portal" />
        <main className="flex-1 overflow-auto scrollbar-thin">
          <TopBar role="customer" />
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
