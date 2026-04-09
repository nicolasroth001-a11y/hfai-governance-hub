import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, TrendingUp } from "lucide-react";

interface ComplianceScoreProps {
  totalSystems: number;
  openViolations: number;
  resolvedViolations: number;
  totalViolations: number;
}

export function ComplianceScore({ totalSystems, openViolations, resolvedViolations, totalViolations }: ComplianceScoreProps) {
  const { score, label, color } = useMemo(() => {
    // No systems = no data to score
    if (totalSystems === 0) return { score: 0, label: "No Data", color: "text-muted-foreground" };

    // Base score starts at 100, deducted by open violations
    let s = 100;

    // Each open violation costs 10 points (capped at 80 deduction)
    s -= Math.min(openViolations * 10, 80);

    // Bonus for resolved violations (up to 10 points back)
    if (totalViolations > 0) {
      const resolutionRate = resolvedViolations / totalViolations;
      s += Math.round(resolutionRate * 10);
    }

    // Clamp 0-100
    s = Math.max(0, Math.min(100, s));

    let lbl = "Excellent";
    let col = "text-emerald-500";
    if (s < 50) { lbl = "Critical"; col = "text-destructive"; }
    else if (s < 70) { lbl = "Needs Work"; col = "text-orange-500"; }
    else if (s < 90) { lbl = "Good"; col = "text-yellow-500"; }

    return { score: s, label: lbl, color: col };
  }, [totalSystems, openViolations, resolvedViolations, totalViolations]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Map color classes to actual stroke colors
  const strokeColor = score === 0 && totalSystems === 0
    ? "stroke-muted-foreground"
    : score < 50
      ? "stroke-destructive"
      : score < 70
        ? "stroke-orange-500"
        : score < 90
          ? "stroke-yellow-500"
          : "stroke-emerald-500";

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Gauge */}
          <div className="relative shrink-0">
            <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-muted/30" />
              <circle
                cx="50" cy="50" r="45" fill="none" strokeWidth="8"
                strokeLinecap="round"
                className={`${strokeColor} transition-all duration-1000 ease-out`}
                style={{ strokeDasharray: circumference, strokeDashoffset }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${color}`}>{score}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Score</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`h-4 w-4 ${color}`} />
              <span className={`text-sm font-semibold ${color}`}>{label}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {totalSystems === 0
                ? "Connect your first AI system to see your compliance score."
                : `${openViolations} open violation${openViolations !== 1 ? "s" : ""} across ${totalSystems} system${totalSystems !== 1 ? "s" : ""}.`}
            </p>
            {totalViolations > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>{Math.round((resolvedViolations / totalViolations) * 100)}% resolution rate</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
