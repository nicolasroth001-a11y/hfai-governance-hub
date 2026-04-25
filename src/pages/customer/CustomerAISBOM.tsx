import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package, Download, FileJson, FileText, Cpu, GitBranch,
  Building2, Database, ShieldCheck, AlertCircle, RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";

interface AISystem {
  id: string;
  name: string;
  description?: string | null;
  provider?: string | null;
  model_type?: string | null;
  version?: string | null;
  risk_level?: string | null;
  eu_risk_tier?: string | null;
  status?: string | null;
  owner_team?: string | null;
  transparency_uri?: string | null;
  data_governance_notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}

interface SystemVersion {
  id: string;
  ai_system_id: string;
  version_label: string;
  change_description?: string | null;
  approved_at?: string | null;
  created_at: string;
}

interface VendorAssessment {
  id: string;
  ai_system_id?: string | null;
  vendor_name: string;
  vendor_contact?: string | null;
  status: string;
  risk_score?: number | null;
  data_processing_agreement?: boolean | null;
  security_review_passed?: boolean | null;
  compliance_status?: string | null;
  assessment_date?: string | null;
}

interface LineageRecord {
  id: string;
  ai_system_id: string;
  data_source_name: string;
  data_source_type: string;
  data_description?: string | null;
  geographic_origin?: string | null;
  pii_detected?: boolean | null;
  retention_period?: string | null;
  consent_basis?: string | null;
  quality_score?: number | null;
}

interface SBOMComponent {
  system: AISystem;
  versions: SystemVersion[];
  vendors: VendorAssessment[];
  lineage: LineageRecord[];
  completeness: number;
}

export default function CustomerAISBOM() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<SBOMComponent[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const orgId = profile?.org_id;

  useEffect(() => {
    if (!orgId) return;
    loadSBOM();
  }, [orgId]);

  async function loadSBOM() {
    if (!orgId) return;
    setLoading(true);
    try {
      const [{ data: systems }, { data: versions }, { data: vendors }, { data: lineage }, { data: org }] =
        await Promise.all([
          supabase.from("ai_systems").select("*").eq("org_id", orgId).order("name"),
          supabase.from("ai_system_versions").select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
          supabase.from("vendor_risk_assessments").select("*").eq("org_id", orgId),
          supabase.from("data_lineage_records").select("*").eq("org_id", orgId),
          supabase.from("organizations").select("name").eq("id", orgId).maybeSingle(),
        ]);

      setOrgName(org?.name || "Organization");

      const built: SBOMComponent[] = (systems || []).map((s) => {
        const sysVersions = (versions || []).filter((v) => v.ai_system_id === s.id);
        const sysVendors = (vendors || []).filter((v) => v.ai_system_id === s.id);
        const sysLineage = (lineage || []).filter((l) => l.ai_system_id === s.id);

        // Completeness score (0-100): 5 dimensions weighted equally
        let score = 0;
        if (s.provider) score += 20;
        if (s.eu_risk_tier && s.eu_risk_tier !== "not_classified") score += 20;
        if (sysVersions.length > 0) score += 20;
        if (sysVendors.length > 0) score += 20;
        if (sysLineage.length > 0) score += 20;

        return {
          system: s,
          versions: sysVersions,
          vendors: sysVendors,
          lineage: sysLineage,
          completeness: score,
        };
      });

      setComponents(built);
    } catch (e) {
      toast({ title: "Failed to load AI-SBOM", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function buildSBOMDocument() {
    return {
      bomFormat: "HFAI-AI-SBOM",
      specVersion: "1.0",
      generatedAt: new Date().toISOString(),
      organization: { id: orgId, name: orgName },
      generator: { tool: "HFAI", url: "https://hfa-i.org" },
      components: components.map((c) => ({
        id: c.system.id,
        name: c.system.name,
        type: "ai-system",
        description: c.system.description || null,
        provider: c.system.provider || null,
        model_type: c.system.model_type || null,
        version: c.system.version || null,
        risk: {
          internal_level: c.system.risk_level || null,
          eu_ai_act_tier: c.system.eu_risk_tier || null,
        },
        ownership: {
          team: c.system.owner_team || null,
          status: c.system.status || null,
        },
        transparency_uri: c.system.transparency_uri || null,
        data_governance_notes: c.system.data_governance_notes || null,
        version_history: c.versions.map((v) => ({
          label: v.version_label,
          change: v.change_description,
          approved_at: v.approved_at,
          created_at: v.created_at,
        })),
        vendors: c.vendors.map((v) => ({
          name: v.vendor_name,
          contact: v.vendor_contact,
          status: v.status,
          risk_score: v.risk_score,
          dpa_signed: v.data_processing_agreement,
          security_reviewed: v.security_review_passed,
          compliance_status: v.compliance_status,
          assessed_at: v.assessment_date,
        })),
        data_sources: c.lineage.map((l) => ({
          name: l.data_source_name,
          type: l.data_source_type,
          description: l.data_description,
          origin: l.geographic_origin,
          pii: l.pii_detected,
          retention: l.retention_period,
          consent_basis: l.consent_basis,
          quality_score: l.quality_score,
        })),
        completeness_score: c.completeness,
        timestamps: {
          created_at: c.system.created_at,
          updated_at: c.system.updated_at,
        },
      })),
      summary: {
        total_systems: components.length,
        total_versions: components.reduce((a, c) => a + c.versions.length, 0),
        total_vendors: components.reduce((a, c) => a + c.vendors.length, 0),
        total_data_sources: components.reduce((a, c) => a + c.lineage.length, 0),
        average_completeness:
          components.length > 0
            ? Math.round(components.reduce((a, c) => a + c.completeness, 0) / components.length)
            : 0,
      },
    };
  }

  function exportJSON() {
    const doc = buildSBOMDocument();
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-sbom-${orgName.replace(/\s+/g, "-").toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "AI-SBOM exported", description: "JSON downloaded successfully" });
  }

  function exportPDF() {
    const doc = buildSBOMDocument();
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("AI Bill of Materials (AI-SBOM)", margin, y);
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Organization: ${orgName}`, margin, y); y += 5;
    pdf.text(`Generated: ${format(new Date(), "PPpp")}`, margin, y); y += 5;
    pdf.text(`Specification: HFAI-AI-SBOM v1.0`, margin, y); y += 8;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Summary", margin, y); y += 6;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`AI Systems: ${doc.summary.total_systems}`, margin, y); y += 5;
    pdf.text(`Version Records: ${doc.summary.total_versions}`, margin, y); y += 5;
    pdf.text(`Vendor Assessments: ${doc.summary.total_vendors}`, margin, y); y += 5;
    pdf.text(`Data Sources: ${doc.summary.total_data_sources}`, margin, y); y += 5;
    pdf.text(`Average Completeness: ${doc.summary.average_completeness}%`, margin, y); y += 10;

    doc.components.forEach((c, idx) => {
      if (y > 250) { pdf.addPage(); y = 20; }
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${idx + 1}. ${c.name}`, margin, y); y += 6;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const lines = [
        `Provider: ${c.provider || "Not set"}  |  Model: ${c.model_type || "—"}  |  Version: ${c.version || "—"}`,
        `EU Risk Tier: ${c.risk.eu_ai_act_tier || "Not classified"}  |  Internal Risk: ${c.risk.internal_level || "—"}`,
        `Owner Team: ${c.ownership.team || "—"}  |  Status: ${c.ownership.status || "—"}`,
        `Versions tracked: ${c.version_history.length}  |  Vendors: ${c.vendors.length}  |  Data sources: ${c.data_sources.length}`,
        `Completeness: ${c.completeness_score}%`,
      ];
      lines.forEach((l) => {
        const wrapped = pdf.splitTextToSize(l, pageWidth - margin * 2);
        pdf.text(wrapped, margin, y);
        y += wrapped.length * 4.5;
      });
      y += 4;
    });

    pdf.save(`ai-sbom-${orgName.replace(/\s+/g, "-").toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast({ title: "AI-SBOM exported", description: "PDF downloaded successfully" });
  }

  const totalSystems = components.length;
  const avgCompleteness =
    totalSystems > 0
      ? Math.round(components.reduce((a, c) => a + c.completeness, 0) / totalSystems)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            AI Bill of Materials
          </h1>
          <p className="text-muted-foreground mt-1">
            Full supply-chain visibility for every AI system in your organization. Export as a single signed artifact for auditors and regulators.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadSBOM} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportJSON} disabled={loading || totalSystems === 0}>
            <FileJson className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button size="sm" onClick={exportPDF} disabled={loading || totalSystems === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>AI Systems</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold flex items-center gap-2"><Cpu className="h-6 w-6 text-primary" />{totalSystems}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Version Records</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold flex items-center gap-2"><GitBranch className="h-6 w-6 text-primary" />{components.reduce((a, c) => a + c.versions.length, 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Vendors Tracked</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6 text-primary" />{components.reduce((a, c) => a + c.vendors.length, 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Avg Completeness</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" />{avgCompleteness}%</div></CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : totalSystems === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No AI systems registered</p>
            <p className="text-muted-foreground text-sm mt-1">
              Register an AI system under <strong>Core → AI Systems</strong> to populate your AI-SBOM.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {components.map((c) => (
            <Card key={c.system.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-primary" />
                      {c.system.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {c.system.provider || "Provider not set"} · {c.system.model_type || "model type unknown"}
                      {c.system.version && ` · v${c.system.version}`}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.system.eu_risk_tier && c.system.eu_risk_tier !== "not_classified" ? (
                      <Badge variant="outline">EU Tier: {c.system.eu_risk_tier}</Badge>
                    ) : (
                      <Badge variant="secondary">Not classified</Badge>
                    )}
                    <Badge variant={c.completeness >= 80 ? "default" : c.completeness >= 40 ? "secondary" : "destructive"}>
                      {c.completeness}% complete
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-xs uppercase text-muted-foreground font-semibold mb-2 flex items-center gap-1">
                      <GitBranch className="h-3 w-3" /> Version History ({c.versions.length})
                    </div>
                    {c.versions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No versions tracked</p>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {c.versions.slice(0, 3).map((v) => (
                          <li key={v.id} className="truncate">
                            <span className="font-medium">{v.version_label}</span>
                            {v.approved_at && <span className="text-muted-foreground"> · approved</span>}
                          </li>
                        ))}
                        {c.versions.length > 3 && (
                          <li className="text-xs text-muted-foreground">+{c.versions.length - 3} more</li>
                        )}
                      </ul>
                    )}
                  </div>
                  <div>
                    <div className="text-xs uppercase text-muted-foreground font-semibold mb-2 flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Vendors ({c.vendors.length})
                    </div>
                    {c.vendors.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No vendor assessments</p>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {c.vendors.slice(0, 3).map((v) => (
                          <li key={v.id} className="truncate">
                            <span className="font-medium">{v.vendor_name}</span>
                            {v.data_processing_agreement && <span className="text-muted-foreground"> · DPA</span>}
                          </li>
                        ))}
                        {c.vendors.length > 3 && (
                          <li className="text-xs text-muted-foreground">+{c.vendors.length - 3} more</li>
                        )}
                      </ul>
                    )}
                  </div>
                  <div>
                    <div className="text-xs uppercase text-muted-foreground font-semibold mb-2 flex items-center gap-1">
                      <Database className="h-3 w-3" /> Data Sources ({c.lineage.length})
                    </div>
                    {c.lineage.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No lineage records</p>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {c.lineage.slice(0, 3).map((l) => (
                          <li key={l.id} className="truncate">
                            <span className="font-medium">{l.data_source_name}</span>
                            {l.pii_detected && <Badge variant="destructive" className="ml-1 h-4 text-[10px]">PII</Badge>}
                          </li>
                        ))}
                        {c.lineage.length > 3 && (
                          <li className="text-xs text-muted-foreground">+{c.lineage.length - 3} more</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-muted/30">
        <CardContent className="py-4 flex items-start gap-3">
          <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">About AI-SBOM:</strong> Modeled on the SBOM concept from cybersecurity (NTIA, CISA), the AI Bill of Materials gives auditors a single artifact listing every AI system, its provenance, vendors, data sources, and version history. Required for EU AI Act Article 11 (technical documentation) and ISO/IEC 42001 traceability controls.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
