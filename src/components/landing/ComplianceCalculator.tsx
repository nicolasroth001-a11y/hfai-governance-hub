import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DEADLINES = [
  { key: "gpai" as const, date: new Date("2026-08-01"), tag: "EU AI Act" },
  { key: "highRiskStandalone" as const, date: new Date("2027-12-01"), tag: "EU AI Act" },
  { key: "highRiskEmbedded" as const, date: new Date("2028-08-01"), tag: "EU AI Act" },
];

type Stage = "not_started" | "early" | "in_progress" | "advanced";
const STAGE_KEYS: Stage[] = ["not_started", "early", "in_progress", "advanced"];
const STAGE_MONTHS: Record<Stage, number> = { not_started: 18, early: 14, in_progress: 8, advanced: 3 };

export function ComplianceCalculator() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const analysis = useMemo(() => {
    if (!selectedStage) return null;
    const monthsNeeded = STAGE_MONTHS[selectedStage];
    const now = new Date();
    return DEADLINES.map(deadline => {
      const monthsUntilDeadline = Math.max(0, (deadline.date.getFullYear() - now.getFullYear()) * 12 + (deadline.date.getMonth() - now.getMonth()));
      const surplus = monthsUntilDeadline - monthsNeeded;
      const status = surplus >= 6 ? "safe" : surplus >= 0 ? "tight" : "behind";
      return { ...deadline, monthsUntilDeadline, monthsNeeded, surplus, status };
    });
  }, [selectedStage]);

  const worstStatus = analysis?.reduce((worst, item) => {
    if (item.status === "behind") return "behind";
    if (item.status === "tight" && worst !== "behind") return "tight";
    return worst;
  }, "safe" as string);

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="border border-border/40 bg-secondary/10 overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">{t("calculator.badge")}</span>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mt-1">{t("calculator.title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("calculator.desc")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {STAGE_KEYS.map((key) => (
              <button key={key} onClick={() => setSelectedStage(key)}
                className={`text-left p-3 rounded-lg border transition-all duration-200 ${selectedStage === key ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border/30 bg-background hover:border-primary/30 hover:bg-primary/5"}`}>
                <span className="text-sm font-medium text-foreground">{t(`calculator.stages.${key}`)}</span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">{t("calculator.monthsRemaining", { months: STAGE_MONTHS[key] })}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {analysis && (
              <motion.div key={selectedStage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <div className={`rounded-lg p-4 mb-4 border ${worstStatus === "behind" ? "bg-destructive/10 border-destructive/30" : worstStatus === "tight" ? "bg-warning/10 border-warning/30" : "bg-emerald-500/10 border-emerald-500/30"}`}>
                  <div className="flex items-center gap-2">
                    {worstStatus === "behind" ? <AlertTriangle className="h-4 w-4 text-destructive shrink-0" /> : worstStatus === "tight" ? <Clock className="h-4 w-4 text-warning shrink-0" /> : <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
                    <span className={`text-sm font-semibold ${worstStatus === "behind" ? "text-destructive" : worstStatus === "tight" ? "text-warning" : "text-emerald-500"}`}>
                      {t(`calculator.${worstStatus}`)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {analysis.map((item) => {
                    const maxMonths = 30;
                    const deadlinePct = Math.min(100, (item.monthsUntilDeadline / maxMonths) * 100);
                    const neededPct = Math.min(100, (item.monthsNeeded / maxMonths) * 100);
                    return (
                      <div key={item.key} className="rounded-lg border border-border/30 bg-background p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-xs font-semibold text-foreground">{t(`calculator.deadlines.${item.key}`)}</span>
                            <span className="text-[10px] text-muted-foreground ml-2">{item.tag}</span>
                          </div>
                          <span className={`text-[10px] font-mono font-bold ${item.status === "behind" ? "text-destructive" : item.status === "tight" ? "text-warning" : "text-emerald-500"}`}>
                            {t("calculator.monthsLeft", { months: item.monthsUntilDeadline })}
                          </span>
                        </div>
                        <div className="relative h-6 bg-muted/30 rounded overflow-hidden">
                          <div className="absolute inset-y-0 left-0 bg-muted/40 rounded" style={{ width: `${deadlinePct}%` }} />
                          <div className={`absolute inset-y-0 left-0 rounded ${item.status === "behind" ? "bg-destructive/30" : item.status === "tight" ? "bg-warning/30" : "bg-emerald-500/20"}`} style={{ width: `${neededPct}%` }} />
                          <div className="absolute inset-0 flex items-center px-2 justify-between">
                            <span className="text-[9px] text-muted-foreground font-mono">{t("calculator.monthsNeeded", { months: item.monthsNeeded })}</span>
                            {item.surplus > 0 && <span className="text-[9px] text-emerald-500 font-mono">{t("calculator.buffer", { months: item.surplus })}</span>}
                            {item.surplus < 0 && <span className="text-[9px] text-destructive font-mono font-bold">{t("calculator.short", { months: item.surplus })}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {worstStatus !== "safe" && (
                  <div className="mt-5 text-center">
                    <Button className="gap-2" onClick={() => navigate("/signup/customer")}>
                      {t("calculator.cta")} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
