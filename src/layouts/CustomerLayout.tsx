import { Outlet } from "react-router-dom";
import { RoleSidebar, NavItem } from "@/components/RoleSidebar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutDashboard, AlertTriangle, BookOpen, ClipboardList, Rocket, Cpu, FileText, Activity, UserCheck } from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/customer/dashboard", icon: LayoutDashboard },
  { title: "AI Systems", url: "/customer/ai-systems", icon: Cpu },
  { title: "Events", url: "/customer/events", icon: Activity },
  { title: "Violations", url: "/customer/violations", icon: AlertTriangle },
  { title: "Human Reviews", url: "/customer/reviews", icon: UserCheck },
  { title: "Rules", url: "/customer/rules", icon: BookOpen },
  { title: "Rule Templates", url: "/customer/rule-templates", icon: FileText },
  { title: "Audit Logs", url: "/customer/logs", icon: ClipboardList },
  { title: "Onboarding", url: "/customer/onboarding", icon: Rocket },
];

export default function CustomerLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleSidebar items={navItems} roleLabel="HFAI" roleDescription="Customer Portal" />
        <main className="flex-1 overflow-auto scrollbar-thin">
          <TopBar role="customer" />
          <div className="px-8 py-8 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
