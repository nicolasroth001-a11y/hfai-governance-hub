import { useState } from "react";
import { LucideIcon, Shield, ChevronDown, Lock } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { TIER_LEVEL, type TierKey } from "@/lib/stripe-config";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  requiredTier?: TierKey;
}

export interface NavSection {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface RoleSidebarProps {
  sections: NavSection[];
  roleLabel: string;
  roleDescription: string;
  /** @deprecated Use sections instead */
  items?: NavItem[];
  /** @deprecated Use sections instead */
  extraSections?: { label: string; items: NavItem[] }[];
}

const TIER_BADGE_LABEL: Partial<Record<TierKey, string>> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
  sovereign: "Sovereign",
};

function SidebarNavItem({ item, currentTier }: { item: NavItem; currentTier: TierKey }) {
  const requiredLevel = TIER_LEVEL[item.requiredTier ?? "free"];
  const currentLevel = TIER_LEVEL[currentTier];
  const locked = requiredLevel > currentLevel;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          end={item.url.split("/").length <= 3}
          className={`rounded-md px-3 py-2 text-[13px] transition-colors ${
            locked
              ? "text-sidebar-foreground/40 hover:bg-sidebar-accent/20"
              : "text-sidebar-foreground hover:bg-sidebar-accent/40"
          }`}
          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        >
          <item.icon className={`mr-3 h-4 w-4 ${locked ? "opacity-30" : "opacity-60"}`} />
          <span className="flex-1 truncate">{item.title}</span>
          {locked && (
            <Lock className="h-3 w-3 ml-auto opacity-40 shrink-0" />
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function CollapsibleSection({ section, currentTier }: { section: NavSection; currentTier: TierKey }) {
  const location = useLocation();
  const hasActiveChild = section.items.some((item) => location.pathname.startsWith(item.url));
  const [open, setOpen] = useState(section.defaultOpen ?? hasActiveChild);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarGroup>
        <CollapsibleTrigger className="flex items-center w-full px-5 py-1.5 text-[11px] uppercase tracking-wider text-sidebar-foreground/50 font-medium hover:text-sidebar-foreground/70 transition-colors cursor-pointer">
          <span className="flex-1 text-left">{section.label}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "" : "-rotate-90"}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-0.5">
              {section.items.map((item) => (
                <SidebarNavItem key={item.url} item={item} currentTier={currentTier} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function RoleSidebar({ sections, roleLabel, roleDescription, items, extraSections }: RoleSidebarProps) {
  const { subscription } = useAuth();
  const currentTier: TierKey = subscription?.tier ?? "free";

  // Legacy support: convert flat items to a single section
  const resolvedSections: NavSection[] = sections.length > 0
    ? sections
    : [
        { label: "Navigation", items: items ?? [], defaultOpen: true },
        ...(extraSections?.map((s) => ({ label: s.label, items: s.items })) ?? []),
      ];

  return (
    <Sidebar>
      <SidebarContent className="scrollbar-thin">
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/90 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-accent-foreground tracking-tight">{roleLabel}</p>
            <p className="text-[11px] text-sidebar-foreground/60">{roleDescription}</p>
          </div>
        </div>

        {resolvedSections.map((section) => (
          <CollapsibleSection key={section.label} section={section} currentTier={currentTier} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
