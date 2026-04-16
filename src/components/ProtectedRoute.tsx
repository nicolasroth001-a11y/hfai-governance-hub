import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "admin" | "reviewer" | "customer";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, profile, isLoading } = useAuth();

  // Only block on the initial auth loading — once isLoading is false, decide immediately
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Authenticating…</p>
      </div>
    );
  }

  // Not authenticated at all
  if (!isAuthenticated) {
    const loginPath = requiredRole === "admin" ? "/login/admin" : "/login";
    return <Navigate to={loginPath} replace />;
  }

  // Authenticated but profile hasn't loaded yet (trigger auto-created, brief delay)
  // Give it a moment but don't block forever — the 8s safety timeout in AuthContext handles the worst case
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  // Role mismatch — redirect to correct dashboard
  if (profile.role !== requiredRole) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }

  return <>{children}</>;
}
