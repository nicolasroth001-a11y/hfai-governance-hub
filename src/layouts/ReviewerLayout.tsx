import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RoleSidebar, NavItem } from "@/components/RoleSidebar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutDashboard, AlertTriangle, BookOpen, Settings2, Shield } from "lucide-react";
import { useReviewerPermissions } from "@/hooks/useReviewerPermissions";
import { Badge } from "@/components/ui/badge";

export default function ReviewerLayout() {
  const { t } = useTranslation();
  const { permissions, isHFAI, isBackup, can } = useReviewerPermissions();

  const navItems: NavItem[] = [
    { title: t("sidebar.dashboard"), url: "/reviewer/dashboard", icon: LayoutDashboard },
    { title: t("sidebar.violations"), url: "/reviewer/violations", icon: AlertTriangle },
  ];

  // Conditionally add nav items based on permissions
  if (can("can_manage_rules")) {
    navItems.push({ title: t("sidebar.rules"), url: "/reviewer/rules", icon: BookOpen });
  }
  if (can("can_manage_systems")) {
    navItems.push({ title: "AI Systems", url: "/reviewer/ai-systems", icon: Settings2 });
  }

  const roleLabel = isHFAI ? "HFAI Reviewer" : "HFAI";
  const roleDescription = isHFAI
    ? (isBackup ? "Backup Reviewer • Override Authority" : "Appointed Reviewer")
    : t("sidebar.reviewerPortal");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleSidebar items={navItems} roleLabel={roleLabel} roleDescription={roleDescription} />
        <main className="flex-1 overflow-auto scrollbar-thin">
          <TopBar role="reviewer" />
          {isHFAI && (
            <div className="px-8 pt-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary gap-1">
                  <Shield className="h-3 w-3" />
                  {isBackup ? "HFAI Backup Reviewer" : "HFAI Appointed Reviewer"}
                </Badge>
                {can("can_override_decisions") && (
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">
                    Override Authority
                  </Badge>
                )}
              </div>
            </div>
          )}
          <div className="px-8 py-8 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
