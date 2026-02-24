import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import ViolationsList from "./pages/ViolationsList";
import ViolationDetail from "./pages/ViolationDetail";
import RulesList from "./pages/RulesList";
import RuleDetail from "./pages/RuleDetail";
import AuditLogs from "./pages/AuditLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/violations" element={<ViolationsList />} />
            <Route path="/violations/:id" element={<ViolationDetail />} />
            <Route path="/rules" element={<RulesList />} />
            <Route path="/rules/:id" element={<RuleDetail />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
