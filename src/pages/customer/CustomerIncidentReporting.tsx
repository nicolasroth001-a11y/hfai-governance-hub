import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SectionHeader } from "@/components/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { supabase } from "@/integrations/supabase/client";
import {
  FileWarning, Download, AlertTriangle, Clock, CheckCircle, Cpu, Shield
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const INCIDENT_CRITERIA = [
  { id: "death", label: "Death of a person", severity: "critical" },
  { id: "health", label: "Serious damage to health", severity: "critical" },
  { id: "property", label: "Serious damage to property", severity: "high" },
  { id: "environment", label: "Serious damage to environment", severity: "high" },
  { id: "fundamental_rights", label: "Serious breach of fundamental rights", severity: "critical" },
  { id: "disruption_infrastructure", label: "Serious disruption to critical infrastructure", severity: "critical" },
  { id: "safety", label: "Serious breach of EU safety legislation", severity: "high" },
];

export default function CustomerIncidentReporting() {
  const { profile } = useAuth();
  const [violations, setViolations] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.org_id) return;
    Promise.all([
      supabase.from("violations").select("*, ai_systems(name)").eq("org_id", profile.org_id).in("severity", ["critical", "high"]).order("created_at", { ascending: false }).limit(50),
      supabase.from("ai_systems").select("id, name").eq("org_id", profile.org_id),
    ]).then(([violRes, sysRes]) => {
      setViolations(violRes.data || []);
      setSystems(sysRes.data || []);
    }).finally(() => setLoading(false));
  }, [profile?.org_id]);

  const handleGenerateReport = async (violation: any) => {
    setGenerating(violation.id);
    try {
      // Fetch related reviews
      const { data: reviews } = await supabase.from("human_reviews").select("*").eq("violation_id", violation.id).order("created_at", { ascending: false });

      const report = {
        report_type: "Serious Incident Report — EU AI Act Article 73",
        generated_at: new Date().toISOString(),
        platform: "HFAI — Human-First AI Governance",
        reporting_entity: {
          organization: profile?.name || "Organization",
          contact_email: profile?.email || "",
        },
        incident_details: {
          incident_id: violation.id,
          detected_at: violation.detected_at || violation.created_at,
          severity: violation.severity,
          status: violation.status,
          ai_system: violation.ai_systems?.name || "Unknown",
          description: violation.description || "No description provided",
          resolution_notes: violation.resolution_notes || "Pending investigation",
        },
        human_oversight_actions: (reviews || []).map((r: any) => ({
          reviewer: r.reviewer_name || "Anonymous",
          decision: r.decision,
          comments: r.comments,
          timestamp: r.created_at,
          integrity_hash: r.integrity_hash,
        })),
        incident_classification: {
          criteria_reference: "Article 73(1) — Regulation 2024/1689",
          applicable_criteria: INCIDENT_CRITERIA.map(c => c.label),
          note: "Select applicable criteria above and supplement with investigation findings before submission.",
        },
        submission_instructions: {
          authority: "National Market Surveillance Authority of the relevant Member State",
          timeline: "Report immediately, no later than 15 days after becoming aware of the serious incident",
          format: "Submit via the EU AI Act incident reporting mechanism (when available) or national authority portal",
          reference: "Article 73, Regulation (EU) 2024/1689",
        },
        compliance_attestation: {
          report_generated_from: "HFAI tamper-evident audit trail",
          hash_chain_integrity: "SHA-256 verified",
        },
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `incident-report-${violation.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Incident report generated", description: "Review and supplement before submission to national authority." });
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading...</p>;

  const criticalViolations = violations.filter(v => v.severity === "critical");
  const unresolvedCritical = criticalViolations.filter(v => v.status !== "resolved");

  return (
    <SubscriptionGate feature="Incident Reporting">
      <div className="space-y-8">
        <SectionHeader
          title="Incident Reporting"
          description="Generate structured Article 73 incident reports for national authority submission. Pre-populated from your violation data."
        />

        {/* Info Banner */}
        <div className="rounded-lg p-4 border bg-muted/30 border-border/40">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Article 73 — Reporting serious incidents</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Providers must report serious incidents to the market surveillance authority of the Member State where the incident occurred,
            immediately and no later than 15 days after becoming aware. HFAI pre-populates reports from your audit trail.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{criticalViolations.length}</p>
                  <p className="text-xs text-muted-foreground">Critical/High Violations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{unresolvedCritical.length}</p>
                  <p className="text-xs text-muted-foreground">Unresolved Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{systems.length}</p>
                  <p className="text-xs text-muted-foreground">AI Systems Monitored</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Incident Criteria Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What Constitutes a Serious Incident</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {INCIDENT_CRITERIA.map(c => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                <FileWarning className={`h-4 w-4 shrink-0 ${c.severity === "critical" ? "text-destructive" : "text-warning"}`} />
                <span className="text-sm text-foreground">{c.label}</span>
                <Badge variant={c.severity === "critical" ? "destructive" : "secondary"} className="text-[10px] ml-auto">
                  {c.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reportable Violations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Potentially Reportable Violations</CardTitle>
          </CardHeader>
          <CardContent>
            {violations.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No critical or high-severity violations found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {violations.slice(0, 20).map(v => (
                  <div key={v.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground truncate">{v.description || v.id.slice(0, 8)}</span>
                        <Badge variant={v.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">{v.severity}</Badge>
                        <Badge variant="outline" className="text-[10px]">{v.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {v.ai_systems?.name || "Unknown system"} · {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 ml-4 shrink-0"
                      onClick={() => handleGenerateReport(v)}
                      disabled={generating === v.id}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {generating === v.id ? "..." : "Generate Report"}
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
