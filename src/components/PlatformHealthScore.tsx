import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, TrendingUp, Activity, Users, Cpu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HealthData {
  totalOrgs: number;
  totalSystems: number;
  totalViolations: number;
  openViolations: number;
  resolvedViolations: number;
  totalReviews: number;
  criticalViolations: number;
}

export function PlatformHealthScore() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [orgsRes, systemsRes, violationsRes, reviewsRes] = await Promise.all([
          supabase.from("organizations").select("id", { count: "exact", head: true }),
          supabase.from("ai_systems").select("id", { count: "exact", head: true }),
          supabase.from("violations").select("id, status, severity"),
          supabase.from("human_reviews").select("id", { count: "exact", head: true }),
        ]);

        const violations = violationsRes.data ?? [];
        setData({
          totalOrgs: orgsRes.count ?? 0,
          totalSystems: systemsRes.count ?? 0,
          totalViolations: violations.length,
          openViolations: violations.filter(v => v.status === "open").length,
          resolvedViolations: violations.filter(v => v.status === "resolved").length,
          totalReviews: reviewsRes.count ?? 0,
          criticalViolations: violations.filter(v => v.severity === "critical" && v.status === "open").length,
        });
      } catch (err) {
        console.error("Platform health load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { score, label, color, strokeColor } = useMemo(() => {
    if (!data || data.totalOrgs === 0) {
      return { score: 0, label: "No Data", color: "text-muted-foreground", strokeColor: "stroke-muted-foreground" };
    }

    let s = 100;

    // Critical violations are heavily penalized
    s -= Math.min(data.criticalViolations * 15, 45);
    // Open violations cost points
    s -= Math.min(data.openViolations * 5, 30);
    // Bonus for resolution rate
    if (data.totalViolations > 0) {
      const rate = data.resolvedViolations / data.totalViolations;
      s += Math.round(rate * 15);
    }
    // Bonus for active human oversight
    if (data.totalReviews > 0) s += Math.min(Math.round(data.totalReviews / 2), 10);

    s = Math.max(0, Math.min(100, s));

    let lbl = "Excellent";
    let col = "text-emerald-500";
    let sc = "stroke-emerald-500";
    if (s < 40) { lbl = "Critical"; col = "text-destructive"; sc = "stroke-destructive"; }
    else if (s < 60) { lbl = "Needs Attention"; col = "text-orange-500"; sc = "stroke-orange-500"; }
    else if (s < 80) { lbl = "Good"; col = "text-yellow-500"; sc = "stroke-yellow-500"; }

    return { score: s, label: lbl, color: col, strokeColor: sc };
  }, [data]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Platform Health</CardTitle>
        </CardHeader>
        <CardContent className="h-32" />
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          HFAI Platform Health
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-5">
          {/* Gauge */}
          <div className="relative shrink-0">
            <svg width="90" height="90" viewBox="0 0 100 100" className="transform -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" strokeWidth="7" className="stroke-muted/30" />
              <circle
                cx="50" cy="50" r="45" fill="none" strokeWidth="7"
                strokeLinecap="round"
                className={`${strokeColor} transition-all duration-1000 ease-out`}
                style={{ strokeDasharray: circumference, strokeDashoffset }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-bold ${color}`}>{score}</span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Health</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className={`h-3.5 w-3.5 ${color}`} />
              <span className={`text-xs font-semibold ${color}`}>{label}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{data?.totalOrgs ?? 0} orgs</span>
              </div>
              <div className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                <span>{data?.totalSystems ?? 0} systems</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-destructive" />
                <span>{data?.openViolations ?? 0} open</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{data?.totalViolations ? Math.round(((data?.resolvedViolations ?? 0) / data.totalViolations) * 100) : 0}% resolved</span>
              </div>
            </div>
            {(data?.criticalViolations ?? 0) > 0 && (
              <p className="text-[10px] text-destructive font-medium mt-1">
                ⚠ {data?.criticalViolations} critical violation{(data?.criticalViolations ?? 0) !== 1 ? "s" : ""} need immediate attention
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
