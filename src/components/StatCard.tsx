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
    <Card className="p-6 animate-fade-in hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-caption font-medium text-card-foreground/50 tracking-wide uppercase">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-card-foreground">{value}</p>
          {subtitle && <p className="text-caption text-card-foreground/40">{subtitle}</p>}
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center">
          <Icon className="h-[18px] w-[18px] text-primary" />
        </div>
      </div>
    </Card>
  );
}
