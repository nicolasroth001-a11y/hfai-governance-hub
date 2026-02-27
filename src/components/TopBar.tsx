import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemoMode } from "@/contexts/DemoModeContext";

interface TopBarProps {
  role: "customer" | "reviewer" | "admin";
  userName?: string;
}

const loginRoutes = {
  customer: "/login/customer",
  reviewer: "/login/reviewer",
  admin: "/login/admin",
};

export function TopBar({ role, userName }: TopBarProps) {
  const navigate = useNavigate();
  const { identities } = useDemoMode();
  const displayName = userName ?? identities[role].email;

  return (
    <div className="flex flex-col">
      <DemoBanner />
      <header className="h-14 flex items-center border-b border-border/40 px-6">
        <SidebarTrigger />
        <div className="ml-auto flex items-center gap-4">
          <span className="text-caption text-muted-foreground">{displayName}</span>
          <div className="h-4 w-px bg-border/60" />
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-caption text-muted-foreground hover:text-foreground h-8 px-2.5"
            onClick={() => navigate(loginRoutes[role])}
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </Button>
        </div>
      </header>
    </div>
  );
}
