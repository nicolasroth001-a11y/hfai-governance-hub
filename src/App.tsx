import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import ReviewerLayout from "./layouts/ReviewerLayout";
import AdminLayout from "./layouts/AdminLayout";

// Login
import CustomerLogin from "./pages/login/CustomerLogin";
import ReviewerLogin from "./pages/login/ReviewerLogin";
import AdminLogin from "./pages/login/AdminLogin";
import LandingPage from "./pages/LandingPage";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerViolations from "./pages/customer/CustomerViolations";
import CustomerViolationDetail from "./pages/customer/CustomerViolationDetail";
import CustomerRules from "./pages/customer/CustomerRules";
import CustomerRuleDetail from "./pages/customer/CustomerRuleDetail";
import CustomerLogs from "./pages/customer/CustomerLogs";

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
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCustomerDetail from "./pages/admin/AdminCustomerDetail";
import AdminLogs from "./pages/admin/AdminLogs";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Login pages */}
          <Route path="/login/customer" element={<CustomerLogin />} />
          <Route path="/login/reviewer" element={<ReviewerLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />

          {/* Customer routes */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="violations" element={<CustomerViolations />} />
            <Route path="violations/:id" element={<CustomerViolationDetail />} />
            <Route path="rules" element={<CustomerRules />} />
            <Route path="rules/:id" element={<CustomerRuleDetail />} />
            <Route path="logs" element={<CustomerLogs />} />
          </Route>

          {/* Reviewer routes */}
          <Route path="/reviewer" element={<ReviewerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ReviewerDashboard />} />
            <Route path="violations" element={<ReviewerViolations />} />
            <Route path="violations/:id" element={<ReviewerViolationDetail />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="violations" element={<AdminViolations />} />
            <Route path="violations/:id" element={<AdminViolationDetail />} />
            <Route path="rules" element={<AdminRules />} />
            <Route path="rules/:id" element={<AdminRuleDetail />} />
            <Route path="reviewers" element={<AdminReviewers />} />
            <Route path="reviewers/:id" element={<AdminReviewerDetail />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id" element={<AdminCustomerDetail />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
