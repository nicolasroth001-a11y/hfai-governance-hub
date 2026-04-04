import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RoleSidebar, NavItem } from "@/components/RoleSidebar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutDashboard, AlertTriangle, BookOpen, ClipboardList, Users, Building2, Plug, ScrollText, BarChart3, FileText, Mail } from "lucide-react";

export default function AdminLayout() {
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { title: t("sidebar.dashboard"), url: "/admin/dashboard", icon: LayoutDashboard },
    { title: t("sidebar.violations"), url: "/admin/violations", icon: AlertTriangle },
    { title: t("sidebar.rules"), url: "/admin/rules", icon: BookOpen },
    { title: t("sidebar.blog"), url: "/admin/blog", icon: FileText },
    { title: t("sidebar.newsletter"), url: "/admin/newsletter", icon: Mail },
    { title: t("sidebar.reviewers"), url: "/admin/reviewers", icon: Users },
    { title: t("sidebar.customers"), url: "/admin/customers", icon: Building2 },
    { title: t("sidebar.connections"), url: "/admin/api-keys", icon: Plug },
    { title: t("sidebar.auditLogs"), url: "/admin/logs", icon: ClipboardList },
    { title: t("sidebar.analytics"), url: "/admin/analytics", icon: BarChart3 },
  ];

  const docItems: NavItem[] = [
    { title: t("sidebar.humanFirstFramework"), url: "/admin/docs/human-first-framework", icon: ScrollText },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleSidebar items={navItems} roleLabel="HFAI" roleDescription={t("sidebar.adminPortal")} extraSections={[{ label: t("sidebar.governanceDoctrine"), items: docItems }]} />
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
