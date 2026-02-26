import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  role: "customer" | "reviewer" | "admin";
  userName?: string;
}

const roleLabels = {
  customer: "Customer Portal",
  reviewer: "Reviewer Portal",
  admin: "Admin Portal",
};

const loginRoutes = {
  customer: "/login/customer",
  reviewer: "/login/reviewer",
  admin: "/login/admin",
};

export function TopBar({ role, userName = "user@hfai.com" }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="h-14 flex items-center border-b border-border/50 px-section">
      <SidebarTrigger />
      <span className="ml-4 text-sm font-medium text-muted-foreground tracking-wide uppercase">
        HFAI Governance
      </span>
      <div className="ml-auto flex items-center gap-3">
        <Badge variant="secondary" className="text-xs font-medium">
          {roleLabels[role]}
        </Badge>
        <span className="text-xs text-muted-foreground">{userName}</span>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => navigate(loginRoutes[role])}
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </Button>
      </div>
    </header>
  );
}
