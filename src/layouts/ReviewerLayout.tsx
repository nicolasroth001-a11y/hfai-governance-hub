import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RoleSidebar, NavItem } from "@/components/RoleSidebar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutDashboard, AlertTriangle } from "lucide-react";

export default function ReviewerLayout() {
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { title: t("sidebar.dashboard"), url: "/reviewer/dashboard", icon: LayoutDashboard },
    { title: t("sidebar.violations"), url: "/reviewer/violations", icon: AlertTriangle },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleSidebar items={navItems} roleLabel="HFAI" roleDescription={t("sidebar.reviewerPortal")} />
        <main className="flex-1 overflow-auto scrollbar-thin">
          <TopBar role="reviewer" />
          <div className="px-8 py-8 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
