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
    <Card className="p-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-card-foreground/60">{title}</p>
          <p className="text-3xl font-semibold tracking-tight mt-2 text-card-foreground">{value}</p>
          {subtitle && <p className="text-xs text-card-foreground/50 mt-1">{subtitle}</p>}
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}
