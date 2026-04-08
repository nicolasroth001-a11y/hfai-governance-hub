import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, ChevronDown, ChevronUp, AlertTriangle, Shield, Download } from "lucide-react";
import jsPDF from "jspdf";

interface AISystem {
  id: string;
  name: string;
  risk_level: string;
  eu_risk_tier: string;
  description: string;
}

const IMPACT_DIMENSIONS = [
  { key: "fundamental_rights", label: "Fundamental Rights Impact", guidance: "Assess impact on human dignity, privacy, non-discrimination, and freedom of expression." },
  { key: "safety_health", label: "Safety & Health", guidance: "Evaluate physical safety, mental health, and wellbeing risks to affected persons." },
  { key: "environment", label: "Environmental Impact", guidance: "Consider energy consumption, carbon footprint, and environmental sustainability." },
  { key: "democracy_rule_of_law", label: "Democracy & Rule of Law", guidance: "Assess effects on democratic processes, access to justice, and legal rights." },
  { key: "social_economic", label: "Social & Economic Impact", guidance: "Evaluate effects on employment, inequality, accessibility, and social cohesion." },
  { key: "transparency_explainability", label: "Transparency & Explainability", guidance: "Assess the degree to which decisions can be explained and understood." },
  { key: "data_governance", label: "Data Governance & Privacy", guidance: "Evaluate data handling, consent, retention, PII exposure, and GDPR compliance." },
  { key: "accountability", label: "Accountability & Oversight", guidance: "Assess human oversight mechanisms, escalation paths, and auditability." },
] as const;

type RatingValue = "none" | "low" | "medium" | "high" | "critical";
const RATINGS: { value: RatingValue; label: string; color: string }[] = [
  { value: "none", label: "None", color: "text-muted-foreground" },
  { value: "low", label: "Low", color: "text-emerald-600" },
  { value: "medium", label: "Medium", color: "text-yellow-600" },
  { value: "high", label: "High", color: "text-orange-600" },
  { value: "critical", label: "Critical", color: "text-destructive" },
];

interface Assessment {
  [key: string]: { rating: RatingValue; notes: string; mitigations: string };
}

export default function CustomerAIImpactAssessment() {
  const { profile } = useAuth();
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(IMPACT_DIMENSIONS[0].key);
  const [assessments, setAssessments] = useState<Record<string, Assessment>>(() => {
    try { return JSON.parse(localStorage.getItem("iso42001_impact") || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    if (!profile?.org_id) { setLoading(false); return; }
    supabase.from("ai_systems").select("id, name, risk_level, eu_risk_tier, description")
      .eq("org_id", profile.org_id)
      .then(({ data }) => {
        const s = (data || []) as AISystem[];
        setSystems(s);
        if (s.length > 0) setSelectedSystem(s[0].id);
        setLoading(false);
      });
  }, [profile?.org_id]);

  const save = (sysId: string, updated: Assessment) => {
    const next = { ...assessments, [sysId]: updated };
    setAssessments(next);
    localStorage.setItem("iso42001_impact", JSON.stringify(next));
  };

  const currentAssessment: Assessment = selectedSystem ? (assessments[selectedSystem] || {}) : {};
  const completedDims = IMPACT_DIMENSIONS.filter((d) => currentAssessment[d.key]?.rating && currentAssessment[d.key].rating !== "none").length;
  const progress = (completedDims / IMPACT_DIMENSIONS.length) * 100;

  const overallRisk = (() => {
    const vals = IMPACT_DIMENSIONS.map((d) => currentAssessment[d.key]?.rating || "none");
    if (vals.includes("critical")) return "critical";
    if (vals.includes("high")) return "high";
    if (vals.includes("medium")) return "medium";
    if (vals.some((v) => v !== "none")) return "low";
    return "none";
  })();

  const handleExportPDF = () => {
    if (!selectedSystem) return;
    const sys = systems.find((s) => s.id === selectedSystem);
    if (!sys) return;

    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16);
    doc.text("AI Impact Assessment — ISO/IEC 42001 Annex B", 14, y);
    y += 10;
    doc.setFontSize(11);
    doc.text(`System: ${sys.name}`, 14, y); y += 6;
    doc.text(`Risk Level: ${sys.risk_level || "unclassified"}`, 14, y); y += 6;
    doc.text(`Overall Impact: ${overallRisk.toUpperCase()}`, 14, y); y += 6;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, y); y += 10;

    IMPACT_DIMENSIONS.forEach((dim) => {
      const a = currentAssessment[dim.key];
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${dim.label}`, 14, y); y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Rating: ${(a?.rating || "not assessed").toUpperCase()}`, 18, y); y += 5;
      if (a?.notes) {
        const lines = doc.splitTextToSize(`Notes: ${a.notes}`, 170);
        doc.text(lines, 18, y); y += lines.length * 4 + 2;
      }
      if (a?.mitigations) {
        const lines = doc.splitTextToSize(`Mitigations: ${a.mitigations}`, 170);
        doc.text(lines, 18, y); y += lines.length * 4 + 2;
      }
      y += 4;
    });

    doc.save(`impact-assessment-${sys.name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    toast({ title: "PDF exported" });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="AI Impact Assessment" description="Structured impact assessment per AI system aligned with ISO 42001 Annex B." />

      {systems.length === 0 ? (
        <ContentCard title="No AI Systems"><p className="text-sm text-muted-foreground py-4 text-center">Register an AI system first.</p></ContentCard>
      ) : (
        <>
          {/* System selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Select value={selectedSystem || ""} onValueChange={setSelectedSystem}>
              <SelectTrigger className="w-full sm:w-72"><SelectValue placeholder="Select system" /></SelectTrigger>
              <SelectContent>
                {systems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={completedDims === 0}>
              <Download className="h-4 w-4 mr-1" /> Export PDF
            </Button>
          </div>

          {/* Progress */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ContentCard title=""><div className="text-center py-2"><p className="text-2xl font-bold text-card-foreground">{completedDims}/{IMPACT_DIMENSIONS.length}</p><p className="text-xs text-muted-foreground mt-1">Assessed</p></div></ContentCard>
            <ContentCard title=""><div className="text-center py-2"><p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p><p className="text-xs text-muted-foreground mt-1">Complete</p></div></ContentCard>
            <ContentCard title=""><div className="text-center py-2"><p className={`text-2xl font-bold ${overallRisk === "critical" ? "text-destructive" : overallRisk === "high" ? "text-orange-600" : overallRisk === "medium" ? "text-yellow-600" : "text-emerald-600"}`}>{overallRisk === "none" ? "—" : overallRisk.toUpperCase()}</p><p className="text-xs text-muted-foreground mt-1">Overall Risk</p></div></ContentCard>
          </div>
          <Progress value={progress} className="h-2" />

          {/* Dimensions */}
          <div className="space-y-3">
            {IMPACT_DIMENSIONS.map((dim) => {
              const isExp = expanded === dim.key;
              const a = currentAssessment[dim.key] || { rating: "none" as RatingValue, notes: "", mitigations: "" };

              return (
                <ContentCard key={dim.key} title="">
                  <button onClick={() => setExpanded(isExp ? null : dim.key)} className="w-full text-left">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-4 w-4 shrink-0 ${a.rating === "critical" ? "text-destructive" : a.rating === "high" ? "text-orange-600" : "text-muted-foreground"}`} />
                        <p className="font-medium text-sm text-card-foreground">{dim.label}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {a.rating !== "none" && (
                          <Badge variant="outline" className="text-[10px]">{a.rating}</Badge>
                        )}
                        {isExp ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </button>

                  {isExp && selectedSystem && (
                    <div className="mt-4 space-y-4 border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground">{dim.guidance}</p>

                      <div>
                        <label className="text-xs font-medium text-card-foreground mb-1 block">Impact Rating</label>
                        <Select value={a.rating} onValueChange={(v) => {
                          const updated = { ...currentAssessment, [dim.key]: { ...a, rating: v as RatingValue } };
                          save(selectedSystem, updated);
                        }}>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {RATINGS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-card-foreground mb-1 block">Assessment Notes</label>
                        <Textarea placeholder="Describe the potential impact..." value={a.notes} onChange={(e) => {
                          const updated = { ...currentAssessment, [dim.key]: { ...a, notes: e.target.value } };
                          save(selectedSystem, updated);
                        }} className="text-xs min-h-[60px]" />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-card-foreground mb-1 block">Mitigations</label>
                        <Textarea placeholder="Describe mitigation measures..." value={a.mitigations} onChange={(e) => {
                          const updated = { ...currentAssessment, [dim.key]: { ...a, mitigations: e.target.value } };
                          save(selectedSystem, updated);
                        }} className="text-xs min-h-[60px]" />
                      </div>
                    </div>
                  )}
                </ContentCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
