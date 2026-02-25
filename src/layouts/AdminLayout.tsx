import { Outlet } from "react-router-dom";
import { RoleSidebar, NavItem } from "@/components/RoleSidebar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutDashboard, AlertTriangle, BookOpen, ClipboardList, Users, Building2, Key } from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Violations", url: "/admin/violations", icon: AlertTriangle },
  { title: "Rules", url: "/admin/rules", icon: BookOpen },
  { title: "Reviewers", url: "/admin/reviewers", icon: Users },
  { title: "Customers", url: "/admin/customers", icon: Building2 },
  { title: "API Keys", url: "/admin/api-keys", icon: Key },
  { title: "Audit Logs", url: "/admin/logs", icon: ClipboardList },
];

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleSidebar items={navItems} roleLabel="HFAI" roleDescription="Admin Portal" />
        <main className="flex-1 overflow-auto">
          <TopBar role="admin" userName="admin@hfai.com" />
          <div className="p-section lg:p-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
