import { Outlet } from "react-router-dom";
import { RoleSidebar, NavItem } from "@/components/RoleSidebar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutDashboard, AlertTriangle, BookOpen, ClipboardList } from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/customer/dashboard", icon: LayoutDashboard },
  { title: "Violations", url: "/customer/violations", icon: AlertTriangle },
  { title: "Rules", url: "/customer/rules", icon: BookOpen },
  { title: "Audit Logs", url: "/customer/logs", icon: ClipboardList },
];

export default function CustomerLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleSidebar items={navItems} roleLabel="HFAI" roleDescription="Customer Portal" />
        <main className="flex-1 overflow-auto">
          <TopBar role="customer" userName="admin@acme.com" />
          <div className="p-section lg:p-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
