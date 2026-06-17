import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "admin" | "reviewer" | "customer";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, profile, isLoading, logout } = useAuth();
  const [profileTimedOut, setProfileTimedOut] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || profile) {
      setProfileTimedOut(false);
      return;
    }

    const timeout = window.setTimeout(() => setProfileTimedOut(true), 8000);
    return () => window.clearTimeout(timeout);
  }, [isLoading, isAuthenticated, profile]);

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
  if (profileTimedOut) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="max-w-sm space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Account connection stalled</h1>
          <p className="text-sm text-muted-foreground">
            Your session is active, but the account profile did not finish loading.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Sign in again
        </button>
      </div>
    );
  }

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
