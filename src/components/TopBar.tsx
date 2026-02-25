import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  role: "customer" | "reviewer" | "admin";
  userName?: string;
}

const roleLabels = {
  customer: "Customer Portal",
  reviewer: "Reviewer Portal",
  admin: "Admin Portal",
};

export function TopBar({ role, userName = "user@hfai.com" }: TopBarProps) {
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
      </div>
    </header>
  );
}
