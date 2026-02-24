import { Card as ShadcnCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
  title?: string;
  /** Span full width in a grid */
  fullWidth?: boolean;
}

export function ContentCard({ children, className, icon: Icon, title, fullWidth }: ContentCardProps) {
  return (
    <ShadcnCard className={cn("p-6 animate-fade-in", fullWidth && "lg:col-span-2", className)}>
      {(Icon || title) && (
        <div className="flex items-center gap-2 mb-4">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {title && <h2 className="text-sm font-semibold text-card-foreground">{title}</h2>}
        </div>
      )}
      {children}
    </ShadcnCard>
  );
}
