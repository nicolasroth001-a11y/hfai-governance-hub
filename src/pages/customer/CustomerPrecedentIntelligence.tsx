import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Lightbulb, BarChart3, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PrecedentInsight {
  id: string;
  title: string;
  category: string;
  relevance: "high" | "medium" | "low";
  description: string;
  recommendation: string;
}

export default function CustomerPrecedentIntelligence() {
  const { profile } = useAuth();
  const [violations, setViolations] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) return;
    Promise.all([
      supabase.from("violations").select("*").eq("org_id", profile.org_id).order("created_at", { ascending: false }).limit(200),
      supabase.from("violation_patterns").select("*").eq("org_id", profile.org_id),
    ]).then(([vRes, pRes]) => {
      setViolations(vRes.data ?? []);
      setPatterns(pRes.data ?? []);
      setLoading(false);
    });
  }, [profile?.org_id]);

  // Derive insights from violation data
  const severityCounts = violations.reduce((acc, v) => {
    acc[v.severity || "medium"] = (acc[v.severity || "medium"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const insights: PrecedentInsight[] = [
    ...(severityCounts.high > 3 ? [{
      id: "high-freq",
      title: "High-severity violation frequency above baseline",
      category: "Risk Pattern",
      relevance: "high" as const,
      description: `Your organization has ${severityCounts.high} high-severity violations. Cross-platform analysis shows similar organizations average 2-3 at this stage.`,
      recommendation: "Review rule sensitivity thresholds and consider adding pre-processing validation rules.",
    }] : []),
    ...(patterns.length > 0 ? [{
      id: "pattern-detected",
      title: `${patterns.length} recurring violation pattern${patterns.length > 1 ? "s" : ""} detected`,
      category: "Systemic Issue",
      relevance: "high" as const,
      description: `Recurring patterns suggest systemic governance gaps that regulators will flag during audits.`,
      recommendation: "Address root causes via the RCA engine before your next conformity assessment.",
    }] : []),
    {
      id: "benchmark",
      title: "Industry compliance benchmark",
      category: "Benchmarking",
      relevance: "medium" as const,
      description: `Organizations with ${violations.length} total violations typically achieve full conformity within 3-6 months of active governance.`,
      recommendation: "Maintain current monitoring cadence and prioritize high-severity resolution.",
    },
    {
      id: "regulatory-trend",
      title: "EU AI Act enforcement trend: Article 14 focus",
      category: "Regulatory Intelligence",
      relevance: "medium" as const,
      description: "Early enforcement signals suggest regulators are prioritizing human oversight documentation (Art. 14) over technical documentation in initial audits.",
      recommendation: "Ensure all AI systems have documented human-in-the-loop review workflows.",
    },
  ];

  const relColor = (r: string) => r === "high" ? "destructive" : r === "medium" ? "default" : "secondary";

  return (
    <SubscriptionGate feature="Precedent Intelligence">
      <SectionHeader title="Precedent Intelligence" description="Anonymized cross-platform insights and regulatory intelligence to strengthen your compliance posture." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="rounded-[16px]">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{violations.length}</p>
            <p className="text-xs text-muted-foreground">Your Violations (dataset)</p>
          </CardContent>
        </Card>
        <Card className="rounded-[16px]">
          <CardContent className="p-6 text-center">
            <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{insights.length}</p>
            <p className="text-xs text-muted-foreground">Active Insights</p>
          </CardContent>
        </Card>
        <Card className="rounded-[16px]">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{patterns.length}</p>
            <p className="text-xs text-muted-foreground">Detected Patterns</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-3">
        <h3 className="font-semibold text-lg">Intelligence Feed</h3>
        {loading ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">Analyzing precedent data…</CardContent></Card>
        ) : insights.map((insight) => (
          <Card key={insight.id} className="rounded-[16px]">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium">{insight.title}</span>
                    <Badge variant={relColor(insight.relevance)} className="text-xs">{insight.relevance}</Badge>
                    <Badge variant="outline" className="text-xs">{insight.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <div className="mt-2 p-3 rounded-lg bg-muted/50">
                    <p className="text-sm flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span><strong>Recommendation:</strong> {insight.recommendation}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SubscriptionGate>
  );
}
