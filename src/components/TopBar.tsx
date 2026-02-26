import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  role: "customer" | "reviewer" | "admin";
  userName?: string;
}

const roleLabels = {
  customer: "Customer",
  reviewer: "Reviewer",
  admin: "Admin",
};

const loginRoutes = {
  customer: "/login/customer",
  reviewer: "/login/reviewer",
  admin: "/login/admin",
};

export function TopBar({ role, userName = "user@hfai.com" }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="h-14 flex items-center border-b border-border/40 px-6">
      <SidebarTrigger />
      <div className="ml-auto flex items-center gap-4">
        <span className="text-caption text-muted-foreground">{userName}</span>
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
  );
}
