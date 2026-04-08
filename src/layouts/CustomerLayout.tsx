import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RoleSidebar, NavItem } from "@/components/RoleSidebar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutDashboard, AlertTriangle, BookOpen, ClipboardList, Rocket, Cpu, FileText, Activity, UserCheck, Bell, ShieldCheck, Plug, Scale, PenSquare, Award, TrendingUp, Brain, Globe, ClipboardCheck, BarChart3, GitBranch, CalendarClock, Building2, Database, GraduationCap, ShieldAlert, FileArchive, FileWarning, Globe2, Fingerprint, Target, FileSpreadsheet } from "lucide-react";

export default function CustomerLayout() {
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { title: t("sidebar.dashboard"), url: "/customer/dashboard", icon: LayoutDashboard },
    { title: t("sidebar.aiSystems"), url: "/customer/ai-systems", icon: Cpu },
    { title: t("sidebar.deploymentReadiness"), url: "/customer/deployment-readiness", icon: ClipboardCheck },
    { title: t("sidebar.events"), url: "/customer/events", icon: Activity },
    { title: t("sidebar.violations"), url: "/customer/violations", icon: AlertTriangle },
    { title: t("sidebar.humanReviews"), url: "/customer/reviews", icon: UserCheck },
    { title: t("sidebar.rules"), url: "/customer/rules", icon: BookOpen },
    { title: t("sidebar.ruleTemplates"), url: "/customer/rule-templates", icon: FileText },
    { title: t("sidebar.biasAuditing"), url: "/customer/bias-auditing", icon: BarChart3 },
    { title: t("sidebar.modelVersions"), url: "/customer/model-versions", icon: GitBranch },
    { title: t("sidebar.scheduledAudits"), url: "/customer/scheduled-audits", icon: CalendarClock },
    { title: t("sidebar.vendorRisk"), url: "/customer/vendor-risk", icon: Building2 },
    { title: t("sidebar.dataLineage"), url: "/customer/data-lineage", icon: Database },
    { title: t("sidebar.euCompliance"), url: "/customer/compliance", icon: Scale },
    { title: "AI Literacy", url: "/customer/ai-literacy", icon: GraduationCap },
    { title: "Prohibited Practices", url: "/customer/prohibited-practices", icon: ShieldAlert },
    { title: "Technical Docs", url: "/customer/technical-docs", icon: FileArchive },
    { title: "Incident Reporting", url: "/customer/incident-reporting", icon: FileWarning },
    { title: "EU Database", url: "/customer/eu-database", icon: Globe2 },
    { title: "ISO 42001 Controls", url: "/customer/iso42001-controls", icon: Fingerprint },
    { title: "AI Impact Assessment", url: "/customer/ai-impact-assessment", icon: Target },
    { title: "Statement of Applicability", url: "/customer/statement-of-applicability", icon: FileSpreadsheet },
    { title: t("sidebar.certificates"), url: "/customer/certificates", icon: Award },
    { title: t("sidebar.driftDetection"), url: "/customer/drift-detection", icon: TrendingUp },
    { title: t("sidebar.precedentIntel"), url: "/customer/precedent-intelligence", icon: Brain },
    { title: t("sidebar.multiJurisdiction"), url: "/customer/multi-jurisdiction", icon: Globe },
    { title: t("sidebar.notifications"), url: "/customer/notifications", icon: Bell },
    { title: t("sidebar.auditLogs"), url: "/customer/logs", icon: ClipboardList },
    { title: t("sidebar.autoConnect"), url: "/customer/connect", icon: Plug },
    { title: t("sidebar.submitBlogPost"), url: "/customer/blog-submit", icon: PenSquare },
    { title: t("sidebar.security"), url: "/customer/security", icon: ShieldCheck },
    { title: t("sidebar.onboarding"), url: "/customer/onboarding", icon: Rocket },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleSidebar items={navItems} roleLabel="HFAI" roleDescription={t("sidebar.customerPortal")} />
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
