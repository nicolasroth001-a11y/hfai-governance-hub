import { Outlet } from "react-router-dom";
import { RoleSidebar, NavItem } from "@/components/RoleSidebar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutDashboard, AlertTriangle, BookOpen, ClipboardList, Users, Building2, Key, ScrollText, BarChart3 } from "lucide-react";
import { useDemoMode } from "@/contexts/DemoModeContext";

const baseNavItems: NavItem[] = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Violations", url: "/admin/violations", icon: AlertTriangle },
  { title: "Rules", url: "/admin/rules", icon: BookOpen },
  { title: "Reviewers", url: "/admin/reviewers", icon: Users },
  { title: "Customers", url: "/admin/customers", icon: Building2 },
  { title: "API Keys", url: "/admin/api-keys", icon: Key },
  { title: "Audit Logs", url: "/admin/logs", icon: ClipboardList },
];

const docItems: NavItem[] = [
  { title: "Human-First Framework", url: "/admin/docs/human-first-framework", icon: ScrollText },
];

export default function AdminLayout() {
  const { isDemo } = useDemoMode();
  const navItems = isDemo
    ? baseNavItems
    : [...baseNavItems, { title: "Analytics", url: "/admin/analytics", icon: BarChart3 }];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleSidebar items={navItems} roleLabel="HFAI" roleDescription="Admin Portal" extraSections={[{ label: "Governance Doctrine", items: docItems }]} />
        <main className="flex-1 overflow-auto scrollbar-thin">
          <TopBar role="admin" />
          <div className="px-8 py-8 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
