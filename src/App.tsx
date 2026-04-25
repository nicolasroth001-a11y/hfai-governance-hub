import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAnalyticsTracker } from "@/hooks/useAnalyticsTracker";

function AnalyticsTracker() {
  useAnalyticsTracker();
  return null;
}

// Layouts (lazy)
const CustomerLayout = lazy(() => import("./layouts/CustomerLayout"));
const ReviewerLayout = lazy(() => import("./layouts/ReviewerLayout"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));

// Login & Signup (lazy)
const CustomerLogin = lazy(() => import("./pages/login/CustomerLogin"));
const AdminLogin = lazy(() => import("./pages/login/AdminLogin"));
const CustomerSignup = lazy(() => import("./pages/signup/CustomerSignup"));
const ForgotPassword = lazy(() => import("./pages/login/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/login/ResetPassword"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AdminCallCopilot = lazy(() => import("./pages/admin/AdminCallCopilot"));
const PricingContact = lazy(() => import("./pages/PricingContact"));
const PilotSignup = lazy(() => import("./pages/PilotSignup"));
const SDKDocs = lazy(() => import("./pages/SDKDocs"));
const GovernancePage = lazy(() => import("./pages/GovernancePage"));
const NISTCompliancePage = lazy(() => import("./pages/NISTCompliancePage"));
const IndustrialAIPage = lazy(() => import("./pages/IndustrialAIPage"));
const BlogIndex = lazy(() => import("./pages/blog/BlogIndex"));
const BlogPostPage = lazy(() => import("./pages/blog/BlogPostPage"));
const BlogSubmit = lazy(() => import("./pages/blog/BlogSubmit"));
const EUAIActOmnibusVII = lazy(() => import("./pages/blog/EUAIActOmnibusVII"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const ReadinessAssessment = lazy(() => import("./pages/ReadinessAssessment"));
const TrustCenter = lazy(() => import("./pages/TrustCenter"));
const ScottDeck = lazy(() => import("./pages/ScottDeck"));

// Customer pages (lazy)
const CustomerDashboard = lazy(() => import("./pages/customer/CustomerDashboard"));
const CustomerViolations = lazy(() => import("./pages/customer/CustomerViolations"));
const CustomerViolationDetail = lazy(() => import("./pages/customer/CustomerViolationDetail"));
const CustomerRules = lazy(() => import("./pages/customer/CustomerRules"));
const CustomerRuleDetail = lazy(() => import("./pages/customer/CustomerRuleDetail"));
const CustomerLogs = lazy(() => import("./pages/customer/CustomerLogs"));
const CustomerOnboarding = lazy(() => import("./pages/customer/CustomerOnboarding"));
const CustomerAISystems = lazy(() => import("./pages/customer/CustomerAISystems"));
const CustomerAISystemDetail = lazy(() => import("./pages/customer/CustomerAISystemDetail"));
const CustomerEvents = lazy(() => import("./pages/customer/CustomerEvents"));
const CustomerEventDetail = lazy(() => import("./pages/customer/CustomerEventDetail"));
const CustomerRuleTemplates = lazy(() => import("./pages/customer/CustomerRuleTemplates"));
const CustomerReviews = lazy(() => import("./pages/customer/CustomerReviews"));
const CustomerNotifications = lazy(() => import("./pages/customer/CustomerNotifications"));
const CustomerSecurity = lazy(() => import("./pages/customer/CustomerSecurity"));
const CustomerConnect = lazy(() => import("./pages/customer/CustomerConnect"));
const CustomerCompliance = lazy(() => import("./pages/customer/CustomerCompliance"));
const CustomerBlogSubmit = lazy(() => import("./pages/customer/CustomerBlogSubmit"));
const CustomerCertificates = lazy(() => import("./pages/customer/CustomerCertificates"));
const CustomerDriftDetection = lazy(() => import("./pages/customer/CustomerDriftDetection"));
const CustomerPrecedentIntelligence = lazy(() => import("./pages/customer/CustomerPrecedentIntelligence"));
const CustomerMultiJurisdiction = lazy(() => import("./pages/customer/CustomerMultiJurisdiction"));
const CustomerDeploymentReadiness = lazy(() => import("./pages/customer/CustomerDeploymentReadiness"));
const CustomerBiasAuditing = lazy(() => import("./pages/customer/CustomerBiasAuditing"));
const CustomerModelVersions = lazy(() => import("./pages/customer/CustomerModelVersions"));
const CustomerScheduledAudits = lazy(() => import("./pages/customer/CustomerScheduledAudits"));
const CustomerVendorRisk = lazy(() => import("./pages/customer/CustomerVendorRisk"));
const CustomerDataLineage = lazy(() => import("./pages/customer/CustomerDataLineage"));
const CustomerAILiteracy = lazy(() => import("./pages/customer/CustomerAILiteracy"));
const CustomerProhibitedPractices = lazy(() => import("./pages/customer/CustomerProhibitedPractices"));
const CustomerTechnicalDocs = lazy(() => import("./pages/customer/CustomerTechnicalDocs"));
const CustomerIncidentReporting = lazy(() => import("./pages/customer/CustomerIncidentReporting"));
const CustomerEUDatabase = lazy(() => import("./pages/customer/CustomerEUDatabase"));
const CustomerISO42001Controls = lazy(() => import("./pages/customer/CustomerISO42001Controls"));
const CustomerAIImpactAssessment = lazy(() => import("./pages/customer/CustomerAIImpactAssessment"));
const CustomerStatementOfApplicability = lazy(() => import("./pages/customer/CustomerStatementOfApplicability"));
const CustomerShadowAIDiscovery = lazy(() => import("./pages/customer/CustomerShadowAIDiscovery"));
const CustomerEvidenceSynthesis = lazy(() => import("./pages/customer/CustomerEvidenceSynthesis"));
const CustomerReviewerSettings = lazy(() => import("./pages/customer/CustomerReviewerSettings"));
const CustomerIntegrations = lazy(() => import("./pages/customer/CustomerIntegrations"));
const CustomerIndustrialOnboarding = lazy(() => import("./pages/customer/CustomerIndustrialOnboarding"));
const CustomerAISBOM = lazy(() => import("./pages/customer/CustomerAISBOM"));

// Reviewer pages (lazy)
const ReviewerDashboard = lazy(() => import("./pages/reviewer/ReviewerDashboard"));
const ReviewerViolations = lazy(() => import("./pages/reviewer/ReviewerViolations"));
const ReviewerViolationDetail = lazy(() => import("./pages/reviewer/ReviewerViolationDetail"));

// Admin pages (lazy)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminViolations = lazy(() => import("./pages/admin/AdminViolations"));
const AdminViolationDetail = lazy(() => import("./pages/admin/AdminViolationDetail"));
const AdminRules = lazy(() => import("./pages/admin/AdminRules"));
const AdminRuleDetail = lazy(() => import("./pages/admin/AdminRuleDetail"));
const AdminReviewers = lazy(() => import("./pages/admin/AdminReviewers"));
const AdminReviewerDetail = lazy(() => import("./pages/admin/AdminReviewerDetail"));
const AdminCreateReviewer = lazy(() => import("./pages/admin/AdminCreateReviewer"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminCustomerDetail = lazy(() => import("./pages/admin/AdminCustomerDetail"));
const AdminCreateCustomer = lazy(() => import("./pages/admin/AdminCreateCustomer"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));
const AdminAPIKeys = lazy(() => import("./pages/admin/AdminAPIKeys"));
const AdminHumanFirstFramework = lazy(() => import("./pages/admin/AdminHumanFirstFramework"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminBlogPosts = lazy(() => import("./pages/admin/AdminBlogPosts"));
const AdminBlogEditor = lazy(() => import("./pages/admin/AdminBlogEditor"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminDemoMode = lazy(() => import("./pages/admin/AdminDemoMode"));
const AdminDemoPresenter = lazy(() => import("./pages/admin/AdminDemoPresenter"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      event.preventDefault();
    };
    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  return (
  <ErrorBoundary>
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AnalyticsTracker />
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/index" element={<Navigate to="/" replace />} />
          <Route path="/pricing" element={<Navigate to="/pricing/contact" replace />} />
          <Route path="/pricing/contact" element={<PricingContact />} />
          <Route path="/pilot" element={<PilotSignup />} />
          <Route path="/sdk-docs" element={<Navigate to="/docs/sdk" replace />} />
          <Route path="/docs/sdk" element={<SDKDocs />} />
          <Route path="/governance" element={<GovernancePage />} />
          <Route path="/nist-ai-rmf" element={<NISTCompliancePage />} />
          <Route path="/industrial-ai" element={<IndustrialAIPage />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/submit" element={<BlogSubmit />} />
          <Route path="/blog/eu-ai-act-omnibus-vii-timeline-update" element={<EUAIActOmnibusVII />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/readiness-assessment" element={<ReadinessAssessment />} />
          <Route path="/trust" element={<TrustCenter />} />
          <Route path="/scott" element={<ScottDeck />} />
          <Route path="/call-copilot" element={<AdminCallCopilot />} />

          {/* Login & Signup & Password Reset */}
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/login/customer" element={<CustomerLogin />} />
          <Route path="/login/reviewer" element={<CustomerLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/signup/customer" element={<CustomerSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Customer routes (protected) */}
          <Route path="/customer" element={<ProtectedRoute requiredRole="customer"><CustomerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="violations" element={<CustomerViolations />} />
            <Route path="violations/:id" element={<CustomerViolationDetail />} />
            <Route path="rules" element={<CustomerRules />} />
            <Route path="rules/:id" element={<CustomerRuleDetail />} />
            <Route path="logs" element={<CustomerLogs />} />
            <Route path="onboarding" element={<CustomerOnboarding />} />
            <Route path="ai-systems" element={<CustomerAISystems />} />
            <Route path="ai-systems/:id" element={<CustomerAISystemDetail />} />
            <Route path="deployment-readiness" element={<CustomerDeploymentReadiness />} />
            <Route path="bias-auditing" element={<CustomerBiasAuditing />} />
            <Route path="model-versions" element={<CustomerModelVersions />} />
            <Route path="scheduled-audits" element={<CustomerScheduledAudits />} />
            <Route path="vendor-risk" element={<CustomerVendorRisk />} />
            <Route path="data-lineage" element={<CustomerDataLineage />} />
            <Route path="events" element={<CustomerEvents />} />
            <Route path="events/:id" element={<CustomerEventDetail />} />
            <Route path="rule-templates" element={<CustomerRuleTemplates />} />
            <Route path="reviews" element={<CustomerReviews />} />
            <Route path="notifications" element={<CustomerNotifications />} />
            <Route path="security" element={<CustomerSecurity />} />
            <Route path="connect" element={<CustomerConnect />} />
            <Route path="compliance" element={<CustomerCompliance />} />
            <Route path="certificates" element={<CustomerCertificates />} />
            <Route path="drift-detection" element={<CustomerDriftDetection />} />
            <Route path="precedent-intelligence" element={<CustomerPrecedentIntelligence />} />
            <Route path="multi-jurisdiction" element={<CustomerMultiJurisdiction />} />
            <Route path="blog-submit" element={<CustomerBlogSubmit />} />
            <Route path="ai-literacy" element={<CustomerAILiteracy />} />
            <Route path="prohibited-practices" element={<CustomerProhibitedPractices />} />
            <Route path="technical-docs" element={<CustomerTechnicalDocs />} />
            <Route path="incident-reporting" element={<CustomerIncidentReporting />} />
            <Route path="eu-database" element={<CustomerEUDatabase />} />
            <Route path="iso42001-controls" element={<CustomerISO42001Controls />} />
            <Route path="ai-impact-assessment" element={<CustomerAIImpactAssessment />} />
            <Route path="statement-of-applicability" element={<CustomerStatementOfApplicability />} />
            <Route path="shadow-ai-discovery" element={<CustomerShadowAIDiscovery />} />
            <Route path="evidence-synthesis" element={<CustomerEvidenceSynthesis />} />
            <Route path="reviewer-settings" element={<CustomerReviewerSettings />} />
            <Route path="integrations" element={<CustomerIntegrations />} />
            <Route path="industrial-onboarding" element={<CustomerIndustrialOnboarding />} />
            <Route path="ai-sbom" element={<CustomerAISBOM />} />
          </Route>

          {/* Reviewer routes (protected) */}
          <Route path="/reviewer" element={<ProtectedRoute requiredRole="reviewer"><ReviewerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ReviewerDashboard />} />
            <Route path="violations" element={<ReviewerViolations />} />
            <Route path="violations/:id" element={<ReviewerViolationDetail />} />
          </Route>

          {/* Admin routes (protected) */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="violations" element={<AdminViolations />} />
            <Route path="violations/:id" element={<AdminViolationDetail />} />
            <Route path="rules" element={<AdminRules />} />
            <Route path="rules/:id" element={<AdminRuleDetail />} />
            <Route path="reviewers" element={<AdminReviewers />} />
            <Route path="reviewers/create" element={<AdminCreateReviewer />} />
            <Route path="reviewers/:id" element={<AdminReviewerDetail />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/create" element={<AdminCreateCustomer />} />
            <Route path="customers/:id" element={<AdminCustomerDetail />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="api-keys" element={<AdminAPIKeys />} />
            <Route path="docs/human-first-framework" element={<AdminHumanFirstFramework />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="blog" element={<AdminBlogPosts />} />
            <Route path="blog/:id" element={<AdminBlogEditor />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="demo-mode" element={<AdminDemoMode />} />
            <Route path="call-copilot" element={<AdminCallCopilot />} />
          </Route>
          <Route path="/admin/demo-mode/present" element={<ProtectedRoute requiredRole="admin"><AdminDemoPresenter /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </AuthProvider>
  </ErrorBoundary>
  );
};

export default App;
