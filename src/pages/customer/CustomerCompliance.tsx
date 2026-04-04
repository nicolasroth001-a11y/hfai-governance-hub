import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield, FileText, AlertTriangle, CheckCircle, Download,
  Cpu, Eye, Users, GitBranch, ClipboardList, ExternalLink
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchAISystems, fetchViolations, fetchRules, fetchReviews } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

const EU_RISK_TIERS = [
  { value: "unacceptable", label: "Unacceptable Risk", color: "destructive", description: "Banned: social scoring, real-time biometric surveillance, manipulative AI" },
  { value: "high_risk", label: "High Risk", color: "destructive", description: "Strict obligations: hiring, credit scoring, law enforcement, critical infrastructure" },
  { value: "limited_risk", label: "Limited Risk", color: "secondary", description: "Transparency obligations: chatbots, deepfakes, emotion recognition" },
  { value: "minimal_risk", label: "Minimal Risk", color: "outline", description: "No specific obligations: spam filters, AI games, recommendations" },
  { value: "not_classified", label: "Not Classified", color: "outline", description: "Risk tier not yet determined" },
] as const;

const CONFORMITY_CHECKLIST = [
  { id: "risk_mgmt", article: "Art. 9", label: "Risk Management System", description: "Continuous identification, analysis, and mitigation of risks throughout the AI lifecycle" },
  { id: "data_gov", article: "Art. 10", label: "Data Governance", description: "Training data is relevant, representative, and free from bias with documentation" },
  { id: "tech_docs", article: "Art. 11", label: "Technical Documentation", description: "Detailed records of system design, development, and testing" },
  { id: "record_keeping", article: "Art. 12", label: "Record Keeping", description: "Automatic logging of AI system operations for traceability" },
  { id: "transparency", article: "Art. 13", label: "Transparency", description: "Clear instructions for users explaining AI capabilities and limitations" },
  { id: "human_oversight", article: "Art. 14", label: "Human Oversight", description: "Designed for effective human oversight, including ability to override or stop AI" },
  { id: "accuracy", article: "Art. 15", label: "Accuracy & Robustness", description: "Appropriate accuracy levels, resilient to errors and attacks" },
  { id: "cybersecurity", article: "Art. 15", label: "Cybersecurity", description: "Protected against unauthorized third-party manipulation" },
  { id: "incident_reporting", article: "Art. 62", label: "Incident Reporting", description: "Serious incidents reported to national authorities within required timeframe" },
  { id: "post_market", article: "Art. 61", label: "Post-Market Monitoring", description: "Ongoing monitoring system proportionate to the nature of the AI" },
];

// Map HFAI features to which checklist items they satisfy
const HFAI_COVERAGE: Record<string, { covered: boolean; feature: string }> = {
  risk_mgmt: { covered: true, feature: "Configurable rule engine with severity classification" },
  data_gov: { covered: false, feature: "Add data governance notes in AI System settings" },
  tech_docs: { covered: true, feature: "AI System registry with model type, provider, version tracking" },
  record_keeping: { covered: true, feature: "Every AI event captured via API with full input/output/metadata" },
  transparency: { covered: true, feature: "Full audit trail with exportable compliance reports" },
  human_oversight: { covered: true, feature: "Human reviewer workflows with approve/reject/escalate" },
  accuracy: { covered: true, feature: "Real-time anomaly detection and pattern analysis" },
  cybersecurity: { covered: false, feature: "Configure security settings in Security page" },
  incident_reporting: { covered: false, feature: "Export compliance reports for authority submission" },
  post_market: { covered: true, feature: "Continuous event monitoring and violation detection" },
};

export default function CustomerCompliance() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [systems, setSystems] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("hfai_conformity_checklist");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    Promise.all([
      fetchAISystems().catch(() => []),
      fetchViolations().catch(() => []),
      fetchRules().catch(() => []),
      fetchReviews().catch(() => []),
    ]).then(([sys, viols, rul, rev]) => {
      setSystems(sys);
      setViolations(viols);
      setRules(rul);
      setReviews(rev);
    }).finally(() => setLoading(false));
  }, []);

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("hfai_conformity_checklist", JSON.stringify(next));
      return next;
    });
  };

  const completedCount = CONFORMITY_CHECKLIST.filter(c => checkedItems[c.id]).length;
  const completionPct = Math.round((completedCount / CONFORMITY_CHECKLIST.length) * 100);

  const highRiskSystems = systems.filter(s => s.eu_risk_tier === "high_risk" || s.risk_level === "high" || s.risk_level === "critical");
  const classifiedSystems = systems.filter(s => s.eu_risk_tier && s.eu_risk_tier !== "not_classified");
  const unclassifiedSystems = systems.filter(s => !s.eu_risk_tier || s.eu_risk_tier === "not_classified");

  const tierColor = (tier: string) => {
    const found = EU_RISK_TIERS.find(t => t.value === tier);
    return found?.color || "outline";
  };

  const handleExportReport = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("compliance-report", {
        body: { org_id: profile?.org_id },
      });
      if (error) throw error;

      // Data comes back as JSON report
      const reportContent = data;
      const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hfai-compliance-report-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: t("customerCompliance.reportExported"), description: t("customerCompliance.reportExportedDesc") });
    } catch (err: any) {
      toast({ title: t("customerCompliance.exportFailed"), description: err.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground py-10 text-center">{t("customerCompliance.loading")}</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <SectionHeader
          title={t("customerCompliance.title")}
          description={t("customerCompliance.description")}
        />
        <Button onClick={handleExportReport} disabled={exporting} className="gap-2">
          <Download className="h-4 w-4" />
          {exporting ? t("customerCompliance.exporting") : t("customerCompliance.exportReport")}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{systems.length}</p>
                <p className="text-xs text-muted-foreground">{t("customerCompliance.aiSystems")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{highRiskSystems.length}</p>
                <p className="text-xs text-muted-foreground">{t("customerCompliance.highRiskSystems")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{classifiedSystems.length}/{systems.length}</p>
                <p className="text-xs text-muted-foreground">{t("customerCompliance.systemsClassified")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completionPct}%</p>
                <p className="text-xs text-muted-foreground">{t("customerCompliance.conformityScore")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="classification" className="space-y-6">
        <TabsList>
          <TabsTrigger value="classification">{t("customerCompliance.riskClassification")}</TabsTrigger>
          <TabsTrigger value="conformity">{t("customerCompliance.conformityChecklist")}</TabsTrigger>
          <TabsTrigger value="coverage">{t("customerCompliance.hfaiCoverage")}</TabsTrigger>
          <TabsTrigger value="timeline">{t("customerCompliance.timeline")}</TabsTrigger>
        </TabsList>

        {/* Risk Classification Tab */}
        <TabsContent value="classification" className="space-y-6">
          {/* Tier Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">EU AI Act Risk Tiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {EU_RISK_TIERS.map(tier => (
                <div key={tier.value} className="flex items-start gap-3">
                  <Badge variant={tier.color as any} className="mt-0.5 shrink-0 capitalize min-w-[120px] justify-center text-xs">
                    {tier.label}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Systems by classification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your AI Systems</CardTitle>
            </CardHeader>
            <CardContent>
              {systems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No AI systems registered. <Link to="/customer/ai-systems" className="text-primary hover:underline">Register one</Link></p>
              ) : (
                <div className="space-y-3">
                  {systems.map(sys => (
                    <div key={sys.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Link to={`/customer/ai-systems/${sys.id}`} className="text-sm font-medium text-foreground hover:text-primary">
                            {sys.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{sys.provider || "Unknown provider"} · {sys.model_type || "Unknown model"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={tierColor(sys.eu_risk_tier) as any} className="capitalize text-xs">
                          {EU_RISK_TIERS.find(t => t.value === sys.eu_risk_tier)?.label || "Not Classified"}
                        </Badge>
                        <Link to={`/customer/ai-systems/${sys.id}`} className="text-xs text-primary hover:underline">
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {unclassifiedSystems.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-xs text-destructive font-medium">
                    ⚠ {unclassifiedSystems.length} system{unclassifiedSystems.length > 1 ? "s" : ""} not yet classified. Classify in AI System settings.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conformity Checklist Tab */}
        <TabsContent value="conformity" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Conformity Self-Assessment</CardTitle>
                <span className="text-sm text-muted-foreground">{completedCount}/{CONFORMITY_CHECKLIST.length} complete</span>
              </div>
              <Progress value={completionPct} className="mt-2" />
            </CardHeader>
            <CardContent className="space-y-1">
              {CONFORMITY_CHECKLIST.map(item => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${checkedItems[item.id] ? "bg-primary/5" : "hover:bg-muted/30"}`}
                >
                  <Checkbox
                    id={item.id}
                    checked={!!checkedItems[item.id]}
                    onCheckedChange={() => toggleCheck(item.id)}
                    className="mt-0.5"
                  />
                  <label htmlFor={item.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground/60">{item.article}</span>
                      <span className={`text-sm font-medium ${checkedItems[item.id] ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {item.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* HFAI Coverage Tab */}
        <TabsContent value="coverage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How HFAI Maps to EU AI Act Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {CONFORMITY_CHECKLIST.map(item => {
                const coverage = HFAI_COVERAGE[item.id];
                return (
                  <div key={item.id} className="flex items-start gap-3 py-3 border-b border-border/20 last:border-0">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${coverage?.covered ? "bg-primary/10" : "bg-muted"}`}>
                      {coverage?.covered ? (
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground/60">{item.article}</span>
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                        <Badge variant={coverage?.covered ? "default" : "secondary"} className="text-[10px] ml-auto">
                          {coverage?.covered ? "Covered" : "Manual"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{coverage?.feature}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <ContentCard title="Automated Coverage">
              <p className="text-3xl font-bold text-primary">
                {Object.values(HFAI_COVERAGE).filter(c => c.covered).length}/{CONFORMITY_CHECKLIST.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Requirements covered by HFAI</p>
            </ContentCard>
            <ContentCard title="Active Rules">
              <p className="text-3xl font-bold text-foreground">{rules.filter((r: any) => r.enabled).length}</p>
              <p className="text-xs text-muted-foreground mt-1">Governance rules enforced</p>
            </ContentCard>
            <ContentCard title="Human Reviews">
              <p className="text-3xl font-bold text-foreground">{reviews.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Decisions reviewed by humans</p>
            </ContentCard>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">EU AI Act Compliance Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { date: "Feb 2025", label: "Prohibited AI Practices Banned", status: "passed", description: "AI systems posing unacceptable risk are banned (social scoring, manipulative AI)." },
                { date: "Aug 2025", label: "GPAI Model Obligations", status: "passed", description: "General-purpose AI model providers must comply with transparency and safety requirements." },
                { date: "Aug 2026", label: "Full High-Risk Obligations", status: "upcoming", description: "All high-risk AI system obligations fully enforceable — conformity assessments, monitoring, and human oversight required." },
                { date: "Aug 2027", label: "Extended Deadline (Annex I)", status: "future", description: "Extended deadline for high-risk AI systems that are safety components of products." },
              ].map((milestone, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    milestone.status === "passed" ? "bg-primary/10" :
                    milestone.status === "upcoming" ? "bg-destructive/10" : "bg-muted"
                  }`}>
                    {milestone.status === "passed" ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : milestone.status === "upcoming" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{milestone.date}</span>
                      <span className="text-sm font-semibold text-foreground">{milestone.label}</span>
                      {milestone.status === "upcoming" && (
                        <Badge variant="destructive" className="text-[10px]">Action Required</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
