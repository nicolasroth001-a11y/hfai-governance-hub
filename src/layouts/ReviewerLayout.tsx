import { Outlet } from "react-router-dom";
import { RoleSidebar, NavItem } from "@/components/RoleSidebar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutDashboard, AlertTriangle } from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/reviewer/dashboard", icon: LayoutDashboard },
  { title: "Violations", url: "/reviewer/violations", icon: AlertTriangle },
];

export default function ReviewerLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleSidebar items={navItems} roleLabel="HFAI" roleDescription="Reviewer Portal" />
        <main className="flex-1 overflow-auto scrollbar-thin">
          <TopBar role="reviewer" userName="reviewer@hfai.com" />
          <div className="px-8 py-8 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
