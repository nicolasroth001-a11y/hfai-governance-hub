import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAnalyticsTracker } from "@/hooks/useAnalyticsTracker";

function AnalyticsTracker() {
  useAnalyticsTracker();
  return null;
}

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import ReviewerLayout from "./layouts/ReviewerLayout";
import AdminLayout from "./layouts/AdminLayout";

// Login & Signup
import CustomerLogin from "./pages/login/CustomerLogin";
import ReviewerLogin from "./pages/login/ReviewerLogin";
import AdminLogin from "./pages/login/AdminLogin";
import CustomerSignup from "./pages/signup/CustomerSignup";
import LandingPage from "./pages/LandingPage";
import PricingContact from "./pages/PricingContact";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerViolations from "./pages/customer/CustomerViolations";
import CustomerViolationDetail from "./pages/customer/CustomerViolationDetail";
import CustomerRules from "./pages/customer/CustomerRules";
import CustomerRuleDetail from "./pages/customer/CustomerRuleDetail";
import CustomerLogs from "./pages/customer/CustomerLogs";
import CustomerOnboarding from "./pages/customer/CustomerOnboarding";
import CustomerAISystems from "./pages/customer/CustomerAISystems";
import CustomerAISystemDetail from "./pages/customer/CustomerAISystemDetail";
import CustomerEvents from "./pages/customer/CustomerEvents";
import CustomerEventDetail from "./pages/customer/CustomerEventDetail";
import CustomerRuleTemplates from "./pages/customer/CustomerRuleTemplates";

// Reviewer pages
import ReviewerDashboard from "./pages/reviewer/ReviewerDashboard";
import ReviewerViolations from "./pages/reviewer/ReviewerViolations";
import ReviewerViolationDetail from "./pages/reviewer/ReviewerViolationDetail";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminViolations from "./pages/admin/AdminViolations";
import AdminViolationDetail from "./pages/admin/AdminViolationDetail";
import AdminRules from "./pages/admin/AdminRules";
import AdminRuleDetail from "./pages/admin/AdminRuleDetail";
import AdminReviewers from "./pages/admin/AdminReviewers";
import AdminReviewerDetail from "./pages/admin/AdminReviewerDetail";
import AdminCreateReviewer from "./pages/admin/AdminCreateReviewer";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCustomerDetail from "./pages/admin/AdminCustomerDetail";
import AdminCreateCustomer from "./pages/admin/AdminCreateCustomer";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminAPIKeys from "./pages/admin/AdminAPIKeys";
import AdminHumanFirstFramework from "./pages/admin/AdminHumanFirstFramework";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
  <DemoModeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AnalyticsTracker />
        <Routes>
          {/* Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing/contact" element={<PricingContact />} />

          {/* Login & Signup */}
          <Route path="/login/customer" element={<CustomerLogin />} />
          <Route path="/login/reviewer" element={<ReviewerLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/signup/customer" element={<CustomerSignup />} />

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
            <Route path="events" element={<CustomerEvents />} />
            <Route path="events/:id" element={<CustomerEventDetail />} />
            <Route path="rule-templates" element={<CustomerRuleTemplates />} />
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
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </DemoModeProvider>
  </AuthProvider>
  </ErrorBoundary>
  );
};

export default App;
