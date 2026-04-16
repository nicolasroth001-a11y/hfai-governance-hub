import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "admin" | "reviewer" | "customer";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, profile, isLoading } = useAuth();

  // Wait for both auth AND profile to resolve
  if (isLoading || (isAuthenticated && !profile)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath = requiredRole === "admin" ? "/login/admin" : "/login";
    return <Navigate to={loginPath} replace />;
  }

  if (profile && profile.role !== requiredRole) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }

  return <>{children}</>;
}
