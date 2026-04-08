import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SectionHeader } from "@/components/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText, Download, Cpu, CheckCircle, AlertTriangle, Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const DOC_SECTIONS = [
  { id: "general_description", article: "Annex IV §1", label: "General Description", description: "Intended purpose, developer identity, system version, and interaction with other systems." },
  { id: "detailed_description", article: "Annex IV §2", label: "Detailed Technical Description", description: "Development methodology, design specifications, system architecture, and computational resources." },
  { id: "monitoring", article: "Annex IV §3", label: "Monitoring & Functioning", description: "Capabilities, limitations, degrees of accuracy, and foreseeable unintended outcomes." },
  { id: "risk_management", article: "Annex IV §4", label: "Risk Management", description: "Risk management measures adopted, residual risks, and testing procedures." },
  { id: "data_requirements", article: "Annex IV §5", label: "Data Requirements", description: "Training, validation, and testing datasets — description, preparation, and data governance." },
  { id: "human_oversight", article: "Annex IV §6", label: "Human Oversight Measures", description: "Measures for human oversight including technical tools and interface design." },
  { id: "lifecycle", article: "Annex IV §7", label: "Lifecycle Management", description: "Expected lifetime, maintenance, updates, and software version management." },
  { id: "standards", article: "Annex IV §8", label: "Standards & Certifications", description: "Harmonised standards applied, and any other standards or technical specifications." },
];

export default function CustomerTechnicalDocs() {
  const { profile } = useAuth();
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.org_id) return;
    Promise.resolve(supabase.from("ai_systems").select("*").eq("org_id", profile.org_id))
      .then(({ data }) => setSystems(data || []))
      .finally(() => setLoading(false));
  }, [profile?.org_id]);

  const handleGenerateDoc = async (system: any) => {
    setGenerating(system.id);
    try {
      // Fetch related data
      const [versionsRes, lineageRes, readinessRes] = await Promise.all([
        supabase.from("ai_system_versions").select("*").eq("ai_system_id", system.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("data_lineage_records").select("*").eq("ai_system_id", system.id),
        supabase.from("deployment_readiness").select("*").eq("ai_system_id", system.id).maybeSingle(),
      ]);

      const doc = {
        document_type: "EU AI Act Technical Documentation (Annex IV)",
        generated_at: new Date().toISOString(),
        platform: "HFAI — Human-First AI Governance",
        ai_system: {
          name: system.name,
          provider: system.provider || "Not specified",
          model_type: system.model_type || "Not specified",
          version: system.version || "Not specified",
          eu_risk_tier: system.eu_risk_tier || "not_classified",
          status: system.status || "registered",
          description: system.description || "",
          owner_team: system.owner_team || "Not assigned",
          transparency_uri: system.transparency_uri || "",
          registered_at: system.created_at,
        },
        sections: {
          general_description: {
            intended_purpose: system.description || "To be documented",
            developer: system.provider || "To be documented",
            version: system.version || "1.0",
            interaction_with_other_systems: "Documented via HFAI event logging",
          },
          monitoring_and_functioning: {
            accuracy_metrics: "Monitored via HFAI drift detection",
            known_limitations: system.data_governance_notes || "To be documented",
          },
          risk_management: {
            risk_tier: system.eu_risk_tier || "not_classified",
            internal_risk_level: system.risk_level || "Not assessed",
            deployment_readiness: readinessRes.data ? {
              status: readinessRes.data.status,
              risk_classified: readinessRes.data.risk_classified,
              oversight_assigned: readinessRes.data.oversight_assigned,
              transparency_documented: readinessRes.data.transparency_documented,
            } : "Not started",
          },
          data_governance: {
            data_sources: (lineageRes.data || []).map((d: any) => ({
              name: d.data_source_name,
              type: d.data_source_type,
              pii_detected: d.pii_detected,
              consent_basis: d.consent_basis,
              quality_score: d.quality_score,
            })),
            notes: system.data_governance_notes || "",
          },
          version_history: (versionsRes.data || []).map((v: any) => ({
            version: v.version_label,
            date: v.created_at,
            description: v.change_description,
            approved: !!v.approved_at,
          })),
          human_oversight: {
            measures: "Configurable HITL review workflows via HFAI",
            transparency_uri: system.transparency_uri || "Not configured",
          },
        },
        compliance_note: "This document is auto-generated from HFAI platform data. Review and supplement with additional details as required by Annex IV of the EU AI Act.",
      };

      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `technical-doc-${system.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Technical documentation exported", description: `Annex IV documentation generated for ${system.name}.` });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading...</p>;

  return (
    <SubscriptionGate feature="Technical Documentation">
      <div className="space-y-8">
        <SectionHeader
          title="GPAI Technical Documentation"
          description="Generate Article 53 / Annex IV structured documentation for your AI systems — required for GPAI models by August 2026."
        />

        {/* Deadline Banner */}
        <div className="rounded-lg p-4 border bg-warning/10 border-warning/30">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-sm font-semibold text-warning">GPAI documentation deadline: August 2, 2026</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            General-Purpose AI providers must maintain technical documentation per Annex IV. HFAI auto-populates from your registered data.
          </p>
        </div>

        {/* Required Sections Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Annex IV Documentation Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DOC_SECTIONS.map(section => (
              <div key={section.id} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{section.label}</span>
                    <Badge variant="outline" className="text-[10px]">{section.article}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Per-System Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate Documentation by System</CardTitle>
          </CardHeader>
          <CardContent>
            {systems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No AI systems registered. Register systems to generate documentation.</p>
            ) : (
              <div className="space-y-3">
                {systems.map(sys => (
                  <div key={sys.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium text-foreground">{sys.name}</span>
                        <p className="text-xs text-muted-foreground">{sys.provider || "Unknown"} · {sys.model_type || "Unknown"}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleGenerateDoc(sys)}
                      disabled={generating === sys.id}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {generating === sys.id ? "Generating..." : "Export Annex IV"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SubscriptionGate>
  );
}
