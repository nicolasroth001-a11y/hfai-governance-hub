import { LucideIcon, Shield } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface RoleSidebarProps {
  items: NavItem[];
  roleLabel: string;
  roleDescription: string;
}

export function RoleSidebar({ items, roleLabel, roleDescription }: RoleSidebarProps) {
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

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-0.5">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url.split("/").length <= 3}
                      className="rounded-md px-3 py-2 text-[13px] text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-3 h-4 w-4 opacity-60" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
