import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RoleSidebar, type NavSection } from "@/components/RoleSidebar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  LayoutDashboard, AlertTriangle, BookOpen, ClipboardList, Rocket, Cpu, FileText,
  Activity, UserCheck, Bell, ShieldCheck, Plug, Scale, PenSquare, Award, TrendingUp,
  Brain, Globe, ClipboardCheck, BarChart3, GitBranch, CalendarClock, Building2,
  Database, GraduationCap, ShieldAlert, FileArchive, FileWarning, Globe2,
  Fingerprint, Target, FileSpreadsheet, Radar, FileOutput, Users, Plug,
} from "lucide-react";

export default function CustomerLayout() {
  const { t } = useTranslation();

  const sections: NavSection[] = [
    {
      label: t("sidebar.core", "Core"),
      defaultOpen: true,
      items: [
        { title: t("sidebar.dashboard"), url: "/customer/dashboard", icon: LayoutDashboard },
        { title: t("sidebar.aiSystems"), url: "/customer/ai-systems", icon: Cpu },
        { title: t("sidebar.events"), url: "/customer/events", icon: Activity },
        { title: t("sidebar.violations"), url: "/customer/violations", icon: AlertTriangle },
        { title: t("sidebar.rules"), url: "/customer/rules", icon: BookOpen },
        { title: t("sidebar.autoConnect"), url: "/customer/connect", icon: Plug },
      ],
    },
    {
      label: t("sidebar.governanceGroup", "Governance"),
      items: [
        { title: t("sidebar.humanReviews"), url: "/customer/reviews", icon: UserCheck, requiredTier: "pro" },
        { title: t("sidebar.ruleTemplates"), url: "/customer/rule-templates", icon: FileText, requiredTier: "enterprise" },
        { title: t("sidebar.deploymentReadiness"), url: "/customer/deployment-readiness", icon: ClipboardCheck },
        { title: t("sidebar.biasAuditing"), url: "/customer/bias-auditing", icon: BarChart3, requiredTier: "pro" },
        { title: t("sidebar.modelVersions"), url: "/customer/model-versions", icon: GitBranch },
        { title: t("sidebar.scheduledAudits"), url: "/customer/scheduled-audits", icon: CalendarClock },
        { title: t("sidebar.vendorRisk"), url: "/customer/vendor-risk", icon: Building2 },
        { title: t("sidebar.dataLineage"), url: "/customer/data-lineage", icon: Database },
        { title: "Shadow AI Discovery", url: "/customer/shadow-ai-discovery", icon: Radar },
        { title: "Evidence Synthesis", url: "/customer/evidence-synthesis", icon: FileOutput },
      ],
    },
    {
      label: t("sidebar.euComplianceGroup", "EU AI Act"),
      items: [
        { title: t("sidebar.euCompliance"), url: "/customer/compliance", icon: Scale },
        { title: "AI Literacy", url: "/customer/ai-literacy", icon: GraduationCap },
        { title: "Prohibited Practices", url: "/customer/prohibited-practices", icon: ShieldAlert },
        { title: "Technical Docs", url: "/customer/technical-docs", icon: FileArchive },
        { title: "Incident Reporting", url: "/customer/incident-reporting", icon: FileWarning },
        { title: "EU Database", url: "/customer/eu-database", icon: Globe2 },
      ],
    },
    {
      label: t("sidebar.isoGroup", "ISO 42001"),
      items: [
        { title: "ISO 42001 Controls", url: "/customer/iso42001-controls", icon: Fingerprint },
        { title: "AI Impact Assessment", url: "/customer/ai-impact-assessment", icon: Target },
        { title: "Statement of Applicability", url: "/customer/statement-of-applicability", icon: FileSpreadsheet },
      ],
    },
    {
      label: t("sidebar.advancedGroup", "Advanced"),
      items: [
        { title: t("sidebar.certificates"), url: "/customer/certificates", icon: Award, requiredTier: "sovereign" },
        { title: t("sidebar.driftDetection"), url: "/customer/drift-detection", icon: TrendingUp, requiredTier: "sovereign" },
        { title: t("sidebar.precedentIntel"), url: "/customer/precedent-intelligence", icon: Brain, requiredTier: "sovereign" },
        { title: t("sidebar.multiJurisdiction"), url: "/customer/multi-jurisdiction", icon: Globe, requiredTier: "sovereign" },
      ],
    },
    {
      label: t("sidebar.settingsGroup", "Settings"),
      items: [
        { title: "Reviewer Permissions", url: "/customer/reviewer-settings", icon: Users },
        { title: "Integrations", url: "/customer/integrations", icon: Plug, requiredTier: "pro" },
        { title: t("sidebar.notifications"), url: "/customer/notifications", icon: Bell, requiredTier: "starter" },
        { title: t("sidebar.auditLogs"), url: "/customer/logs", icon: ClipboardList, requiredTier: "pro" },
        { title: t("sidebar.security"), url: "/customer/security", icon: ShieldCheck },
        { title: t("sidebar.onboarding"), url: "/customer/onboarding", icon: Rocket },
        { title: t("sidebar.submitBlogPost"), url: "/customer/blog-submit", icon: PenSquare },
      ],
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleSidebar sections={sections} roleLabel="HFAI" roleDescription={t("sidebar.customerPortal")} />
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
