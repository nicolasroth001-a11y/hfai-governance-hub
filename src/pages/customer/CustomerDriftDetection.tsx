import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Activity, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DriftAlert {
  id: string;
  system_name: string;
  type: "risk_reclassification" | "behavior_change" | "compliance_gap";
  severity: "low" | "medium" | "high";
  message: string;
  detected_at: string;
}

export default function CustomerDriftDetection() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [systems, setSystems] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) return;
    Promise.all([
      supabase.from("ai_systems").select("*").eq("org_id", profile.org_id),
      supabase.from("violations").select("*").eq("org_id", profile.org_id).order("created_at", { ascending: false }).limit(100),
    ]).then(([sysRes, violRes]) => {
      setSystems(sysRes.data ?? []);
      setViolations(violRes.data ?? []);
      setLoading(false);
    });
  }, [profile?.org_id]);

  const driftAlerts: DriftAlert[] = systems.map((sys) => {
    const sysViolations = violations.filter((v) => v.ai_system_id === sys.id);
    const recentCount = sysViolations.filter((v) => {
      const d = new Date(v.created_at);
      return d > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }).length;
    const olderCount = sysViolations.filter((v) => {
      const d = new Date(v.created_at);
      return d <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && d > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    }).length;

    if (recentCount > olderCount * 2 && recentCount > 2) {
      return {
        id: sys.id,
        system_name: sys.name,
        type: "behavior_change" as const,
        severity: recentCount > 10 ? "high" as const : "medium" as const,
        message: `Violation rate increased ${olderCount > 0 ? Math.round((recentCount / olderCount) * 100) : 100}% in the last 7 days (${recentCount} violations).`,
        detected_at: new Date().toISOString(),
      };
    }
    return null;
  }).filter(Boolean) as DriftAlert[];

  const sevColor = (s: string) => s === "high" ? "destructive" : s === "medium" ? "default" : "secondary";

  return (
    <SubscriptionGate feature={t("customerDrift.title")}>
      <SectionHeader title={t("customerDrift.title")} description={t("customerDrift.description")} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="rounded-[16px]">
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{systems.length}</p>
            <p className="text-xs text-muted-foreground">{t("customerDrift.systemsMonitored")}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[16px]">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold">{driftAlerts.length}</p>
            <p className="text-xs text-muted-foreground">{t("customerDrift.activeDriftAlerts")}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[16px]">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{systems.length - driftAlerts.length}</p>
            <p className="text-xs text-muted-foreground">{t("customerDrift.systemsStable")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-3">
        <h3 className="font-semibold text-lg">{t("customerDrift.driftAlerts")}</h3>
        {loading ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">{t("customerDrift.analyzing")}</CardContent></Card>
        ) : driftAlerts.length === 0 ? (
          <Card className="rounded-[16px]">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="font-medium">{t("customerDrift.allStable")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("customerDrift.allStableDesc")}</p>
            </CardContent>
          </Card>
        ) : driftAlerts.map((alert) => (
          <Card key={alert.id} className="rounded-[16px]">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{alert.system_name}</span>
                  <Badge variant={sevColor(alert.severity)} className="text-xs">{alert.severity}</Badge>
                  <Badge variant="outline" className="text-xs">{alert.type.replace("_", " ")}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {t("customerDrift.detectedNow")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SubscriptionGate>
  );
}
