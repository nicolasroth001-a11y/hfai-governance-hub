import { Card } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, subtitle }: StatCardProps) {
  return (
    <Card className="p-3 sm:p-6 animate-fade-in hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 sm:space-y-2 min-w-0">
          <p className="text-[10px] sm:text-caption font-medium text-card-foreground/50 tracking-wide uppercase truncate">{title}</p>
          <p className="text-xl sm:text-3xl font-semibold tracking-tight text-card-foreground">{value}</p>
          {subtitle && <p className="text-[10px] sm:text-caption text-card-foreground/40 truncate">{subtitle}</p>}
        </div>
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-primary" />
        </div>
      </div>
    </Card>
  );
}
