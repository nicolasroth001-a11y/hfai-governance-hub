import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/contexts/DemoModeContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "admin" | "reviewer" | "customer";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, profile, isLoading } = useAuth();
  const { isDemo } = useDemoMode();

  // In demo mode, always allow access
  if (isDemo) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login/${requiredRole}`} replace />;
  }

  if (profile && profile.role !== requiredRole) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }

  return <>{children}</>;
}
