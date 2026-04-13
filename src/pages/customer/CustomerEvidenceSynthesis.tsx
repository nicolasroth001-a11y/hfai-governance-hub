import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText, Download, CheckCircle, AlertTriangle, Shield, Clock,
  Cpu, BookOpen, UserCheck, Activity, BarChart3, Archive,
  RefreshCw, Loader2,
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";

interface EvidenceSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "complete" | "partial" | "missing";
  count: number;
  description: string;
  regulation: string;
}

export default function CustomerEvidenceSynthesis() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sections, setSections] = useState<EvidenceSection[]>([]);
  const [rawData, setRawData] = useState<Record<string, unknown[]>>({});

  const orgId = profile?.org_id;

  useEffect(() => {
    if (!orgId) return;
    collectEvidence();
  }, [orgId]);

  async function collectEvidence() {
    if (!orgId) return;
    setLoading(true);
    try {
      // Parallel fetch all evidence sources
      const [
        { data: systems },
        { data: violations },
        { data: reviews },
        { data: rules },
        { data: auditLogs },
        { data: biasAudits },
        { data: dataLineage },
        { data: deployReady },
        { data: vendorRisk },
      ] = await Promise.all([
        supabase.from("ai_systems").select("*").eq("org_id", orgId),
        supabase.from("violations").select("*").eq("org_id", orgId),
        supabase.from("human_reviews").select("*, violations!inner(org_id)").eq("violations.org_id", orgId),
        supabase.from("rules").select("*").or(`org_id.eq.${orgId},org_id.is.null`),
        supabase.from("audit_logs").select("*").eq("org_id", orgId).order("created_at", { ascending: false }).limit(500),
        supabase.from("bias_fairness_audits").select("*").eq("org_id", orgId),
        supabase.from("data_lineage_records").select("*").eq("org_id", orgId),
        supabase.from("deployment_readiness").select("*").eq("org_id", orgId),
        supabase.from("vendor_risk_assessments").select("*").eq("org_id", orgId),
      ]);

      const data: Record<string, unknown[]> = {
        systems: systems || [],
        violations: violations || [],
        reviews: reviews || [],
        rules: rules || [],
        auditLogs: auditLogs || [],
        biasAudits: biasAudits || [],
        dataLineage: dataLineage || [],
        deployReady: deployReady || [],
        vendorRisk: vendorRisk || [],
      };
      setRawData(data);

      const getStatus = (count: number, min: number): "complete" | "partial" | "missing" =>
        count >= min ? "complete" : count > 0 ? "partial" : "missing";

      const evidenceSections: EvidenceSection[] = [
        {
          id: "inventory",
          title: "AI System Inventory",
          icon: Cpu,
          status: getStatus((systems || []).length, 1),
          count: (systems || []).length,
          description: "Complete registry of all AI systems with risk classification, provider, and ownership.",
          regulation: "EU AI Act Art. 9, ISO 42001 §6.1",
        },
        {
          id: "rules",
          title: "Governance Rules",
          icon: BookOpen,
          status: getStatus((rules || []).length, 3),
          count: (rules || []).length,
          description: "Configurable compliance rules with enforcement modes and severity levels.",
          regulation: "EU AI Act Art. 9-15",
        },
        {
          id: "violations",
          title: "Violation Records",
          icon: AlertTriangle,
          status: getStatus((violations || []).length, 0),
          count: (violations || []).length,
          description: "Complete history of detected violations with severity, status, and resolution.",
          regulation: "EU AI Act Art. 62, NIST AI RMF Manage",
        },
        {
          id: "reviews",
          title: "Human Oversight Evidence",
          icon: UserCheck,
          status: getStatus((reviews || []).length, 0),
          count: (reviews || []).length,
          description: "Tamper-evident, hash-chained records of human review decisions.",
          regulation: "EU AI Act Art. 14",
        },
        {
          id: "audit",
          title: "Audit Trail",
          icon: Activity,
          status: getStatus((auditLogs || []).length, 10),
          count: (auditLogs || []).length,
          description: "Immutable log of all platform actions with actor, timestamp, and context.",
          regulation: "EU AI Act Art. 12, ISO 42001 §9.2",
        },
        {
          id: "bias",
          title: "Bias & Fairness Audits",
          icon: BarChart3,
          status: getStatus((biasAudits || []).length, 1),
          count: (biasAudits || []).length,
          description: "Documented fairness evaluations with metric scores, thresholds, and pass/fail status.",
          regulation: "EU AI Act Art. 10, NIST AI RMF Measure",
        },
        {
          id: "lineage",
          title: "Data Lineage Records",
          icon: Archive,
          status: getStatus((dataLineage || []).length, 1),
          count: (dataLineage || []).length,
          description: "Tracking of data sources, PII detection, consent basis, and geographic origin.",
          regulation: "EU AI Act Art. 10, GDPR Art. 30",
        },
        {
          id: "deployment",
          title: "Deployment Readiness",
          icon: Shield,
          status: getStatus((deployReady || []).length, 1),
          count: (deployReady || []).length,
          description: "Pre-deployment governance checklists ensuring all controls are in place.",
          regulation: "EU AI Act Art. 16, ISO 42001 §8.1",
        },
        {
          id: "vendor",
          title: "Vendor Risk Assessments",
          icon: FileText,
          status: getStatus((vendorRisk || []).length, 0),
          count: (vendorRisk || []).length,
          description: "Third-party AI provider evaluations with security and compliance scoring.",
          regulation: "EU AI Act Art. 25, ISO 42001 Annex A",
        },
      ];

      setSections(evidenceSections);
    } catch (err) {
      console.error(err);
      toast({ title: "Evidence collection failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const completeSections = sections.filter(s => s.status === "complete").length;
  const totalSections = sections.length;
  const completionPct = totalSections > 0 ? Math.round((completeSections / totalSections) * 100) : 0;

  async function handleExportPDF() {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const now = format(new Date(), "PPpp");
      let y = 20;

      // Title
      doc.setFontSize(18);
      doc.setTextColor(30, 30, 30);
      doc.text("Compliance Evidence Package", 20, y);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${now}`, 20, y);
      doc.text(`Organization: ${profile?.name || "N/A"}`, 20, y + 5);
      doc.text(`Evidence Completion: ${completionPct}%`, 20, y + 10);
      y += 25;

      // Executive Summary
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text("Executive Summary", 20, y);
      y += 8;
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);

      const summaryLines = doc.splitTextToSize(
        `This evidence package was automatically synthesized from live platform telemetry. ` +
        `It covers ${totalSections} evidence categories with ${completeSections} fully documented. ` +
        `The package demonstrates compliance posture across EU AI Act, NIST AI RMF, and ISO 42001 requirements.`,
        170
      );
      doc.text(summaryLines, 20, y);
      y += summaryLines.length * 5 + 8;

      // Evidence sections
      for (const section of sections) {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        const statusIcon = section.status === "complete" ? "✓" : section.status === "partial" ? "◐" : "✗";
        doc.text(`${statusIcon} ${section.title}`, 20, y);
        y += 6;

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Regulation: ${section.regulation}`, 25, y);
        y += 4;
        doc.text(`Records: ${section.count} | Status: ${section.status.toUpperCase()}`, 25, y);
        y += 4;

        const descLines = doc.splitTextToSize(section.description, 160);
        doc.text(descLines, 25, y);
        y += descLines.length * 4 + 6;
      }

      // Data appendix
      doc.addPage();
      y = 20;
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text("Appendix: AI System Inventory", 20, y);
      y += 10;

      const systems = (rawData.systems || []) as Array<Record<string, unknown>>;
      doc.setFontSize(8);
      for (const sys of systems.slice(0, 20)) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setTextColor(30, 30, 30);
        doc.text(`• ${sys.name as string}`, 25, y);
        y += 4;
        doc.setTextColor(100, 100, 100);
        doc.text(`  Provider: ${sys.provider || "N/A"} | Risk: ${sys.risk_level || "N/A"} | Status: ${sys.status || "N/A"}`, 25, y);
        y += 6;
      }

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`HFAI Compliance Evidence Package — Page ${i}/${pageCount} — Machine-generated from live telemetry`, 20, 285);
      }

      doc.save(`hfai-evidence-package-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({ title: "Evidence package exported", description: "PDF downloaded successfully." });
    } catch (err) {
      console.error(err);
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  async function handleExportJSON() {
    setGenerating(true);
    try {
      const evidencePackage = {
        meta: {
          generatedAt: new Date().toISOString(),
          generator: "HFAI Evidence Synthesis Engine",
          version: "1.0.0",
          orgId,
          completionPct,
        },
        summary: sections.map(s => ({
          category: s.title,
          status: s.status,
          recordCount: s.count,
          regulation: s.regulation,
        })),
        data: rawData,
      };

      const blob = new Blob([JSON.stringify(evidencePackage, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hfai-evidence-package-${format(new Date(), "yyyy-MM-dd")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Evidence package exported", description: "JSON downloaded successfully." });
    } catch (err) {
      console.error(err);
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  const statusColor = (status: string) => {
    if (status === "complete") return "text-primary";
    if (status === "partial") return "text-chart-4";
    return "text-destructive";
  };

  const statusBg = (status: string) => {
    if (status === "complete") return "bg-primary/10";
    if (status === "partial") return "bg-chart-4/10";
    return "bg-destructive/10";
  };

  return (
    <SubscriptionGate feature="Automated Evidence Synthesis">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Evidence Synthesis
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Auto-generate audit-ready compliance evidence from live platform data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={collectEvidence} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Completion Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Evidence Completion</p>
                  <span className="text-sm font-mono font-bold text-primary">{completionPct}%</span>
                </div>
                <Progress value={completionPct} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {completeSections}/{totalSections} categories fully documented •{" "}
                  {sections.filter(s => s.status === "partial").length} partial •{" "}
                  {sections.filter(s => s.status === "missing").length} missing
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleExportPDF} disabled={generating} className="gap-2">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Export PDF
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportJSON} disabled={generating} className="gap-2">
                  <Download className="h-4 w-4" />
                  JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Collecting evidence from platform data…</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <Card key={section.id} className="hover:border-primary/20 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${statusBg(section.status)}`}>
                      <section.icon className={`h-5 w-5 ${statusColor(section.status)}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{section.title}</p>
                        {section.status === "complete" ? (
                          <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                        ) : section.status === "partial" ? (
                          <Clock className="h-3.5 w-3.5 text-chart-4 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{section.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{section.count} records</Badge>
                        <Badge variant="secondary" className="text-[10px]">{section.regulation}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* What is Evidence Synthesis */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              What is Evidence Synthesis?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              When regulators or auditors assess your AI compliance, they need <strong className="text-foreground">documented proof</strong> that
              your governance controls are actually working — not just that policies exist on paper. This is called an
              <strong className="text-foreground"> evidence package</strong>.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Traditionally, compiling this evidence takes weeks of manual work: pulling logs, gathering review records,
              cross-referencing regulations. <strong className="text-foreground">Evidence Synthesis automates this entirely</strong> by
              aggregating data from 9 live governance sources and mapping each to the specific regulatory articles that require it
              (EU AI Act, NIST AI RMF, ISO 42001).
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The exported PDF or JSON package is ready to hand directly to auditors, legal counsel, or regulatory bodies
              as proof of your compliance posture.
            </p>
          </CardContent>
        </Card>

        {/* How it works */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Activity,
              title: "Telemetry-Driven",
              desc: "Evidence is collected from live platform data — not manual attestation or self-reported forms. Every record is backed by real system activity.",
            },
            {
              icon: Shield,
              title: "Regulator-Ready",
              desc: "Each evidence category maps directly to specific EU AI Act articles, NIST AI RMF functions, and ISO 42001 clauses — so auditors see exactly what they need.",
            },
            {
              icon: RefreshCw,
              title: "Always Current",
              desc: "Re-generate at any time to capture the latest compliance posture. Unlike static reports, your evidence package is never stale.",
            },
          ].map((card) => (
            <Card key={card.title}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <card.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{card.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{card.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SubscriptionGate>
  );
}
