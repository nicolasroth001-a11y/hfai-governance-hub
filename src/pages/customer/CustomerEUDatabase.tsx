import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SectionHeader } from "@/components/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe, Download, Cpu, CheckCircle, AlertTriangle, Database, ExternalLink, Send
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const REGISTRATION_FIELDS = [
  { id: "provider_name", label: "Provider / Deployer Name", description: "Legal name of the entity placing the AI system on the market.", article: "Art. 71(1)(a)" },
  { id: "system_name", label: "AI System Name & Version", description: "Trade name and unique identifier of the system.", article: "Art. 71(1)(b)" },
  { id: "intended_purpose", label: "Intended Purpose", description: "Description of the intended purpose and use cases.", article: "Art. 71(1)(c)" },
  { id: "risk_classification", label: "Risk Classification", description: "EU risk tier classification with justification.", article: "Art. 71(1)(d)" },
  { id: "status_market", label: "Market Status", description: "Whether placed on market, put into service, or no longer available.", article: "Art. 71(1)(e)" },
  { id: "conformity_assessment", label: "Conformity Assessment", description: "Type of conformity assessment performed (self-assessment or third-party).", article: "Art. 71(1)(f)" },
  { id: "member_states", label: "EU Member States", description: "Member States where the system is or will be placed on the market or put into service.", article: "Art. 71(1)(g)" },
  { id: "contact_info", label: "Contact Information", description: "Name, address, email, and contact details of the provider.", article: "Art. 71(1)(h)" },
  { id: "url_instructions", label: "URL for Instructions", description: "URL where instructions for use can be accessed.", article: "Art. 71(1)(i)" },
];

export default function CustomerEUDatabase() {
  const { profile } = useAuth();
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const saved = localStorage.getItem("hfai_eu_db_readiness");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    if (!profile?.org_id) return;
    Promise.resolve(supabase.from("ai_systems").select("*").eq("org_id", profile.org_id))
      .then(({ data }) => setSystems(data || []))
      .finally(() => setLoading(false));
  }, [profile?.org_id]);

  const toggleField = (systemId: string, fieldId: string) => {
    setReadiness(prev => {
      const sysFields = prev[systemId] || {};
      const next = { ...prev, [systemId]: { ...sysFields, [fieldId]: !sysFields[fieldId] } };
      localStorage.setItem("hfai_eu_db_readiness", JSON.stringify(next));
      return next;
    });
  };

  const getSystemReadiness = (systemId: string) => {
    const fields = readiness[systemId] || {};
    const completed = REGISTRATION_FIELDS.filter(f => fields[f.id]).length;
    return { completed, total: REGISTRATION_FIELDS.length, pct: Math.round((completed / REGISTRATION_FIELDS.length) * 100) };
  };

  const buildSubmissionPackage = (system: any) => {
    const fields = readiness[system.id] || {};
    return {
      schema_version: "1.0",
      document_type: "EU AI Database Submission Package (Article 71)",
      format: "EU-DB-INTEROP-v1",
      generated_at: new Date().toISOString(),
      platform: "HFAI — Human-First AI Governance",
      provider_information: {
        legal_name: system.provider || "[TO BE COMPLETED]",
        contact_email: "[TO BE COMPLETED]",
        eu_representative: "[TO BE COMPLETED — if non-EU provider]",
      },
      ai_system: {
        trade_name: system.name,
        unique_identifier: system.id,
        version: system.version || "1.0",
        description: system.description || "[TO BE COMPLETED]",
        intended_purpose: system.description || "[TO BE COMPLETED]",
        risk_classification: {
          eu_risk_tier: system.eu_risk_tier || "not_classified",
          annex_iii_category: "[TO BE COMPLETED]",
          justification: "[TO BE COMPLETED]",
        },
        market_status: system.status === "active" ? "placed_on_market" : "not_yet_available",
        conformity_assessment: {
          type: "[self_assessment | third_party]",
          body: "[TO BE COMPLETED if third-party]",
          certificate_reference: "[TO BE COMPLETED]",
        },
        member_states_deployed: ["[TO BE COMPLETED]"],
        instructions_url: system.transparency_uri || "[TO BE COMPLETED]",
      },
      registration_checklist: REGISTRATION_FIELDS.map(f => ({
        field_id: f.id,
        field: f.label,
        article: f.article,
        status: fields[f.id] ? "ready" : "incomplete",
      })),
      readiness_summary: getSystemReadiness(system.id),
      submission_metadata: {
        target_database: "https://ai-systems-database.ec.europa.eu",
        api_endpoint: "Not yet available — EU database API expected 2027",
        submission_format: "JSON (EU-DB-INTEROP-v1)",
        submission_status: "pre_registration",
      },
    };
  };

  const handleExport = (system: any) => {
    const doc = buildSubmissionPackage(system);
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eu-database-submission-${system.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Submission package exported", description: `EU database package for ${system.name} downloaded.` });
  };

  const handleSubmitPreRegistration = async (system: any) => {
    const { pct } = getSystemReadiness(system.id);
    if (pct < 100) {
      toast({ title: "Incomplete checklist", description: "Complete all fields before submitting.", variant: "destructive" });
      return;
    }
    // Log the submission intent to audit trail
    await supabase.from("audit_logs").insert({
      action: "eu_database_preregistration",
      entity_type: "ai_system",
      entity_id: system.id,
      details: `Pre-registration package prepared for ${system.name}. Awaiting EU database API availability.`,
      org_id: profile?.org_id,
    });
    toast({
      title: "Pre-registration recorded",
      description: "Your submission intent has been logged. HFAI will auto-submit when the EU database API goes live.",
    });
  };

  const highRiskSystems = systems.filter(s => s.eu_risk_tier === "high_risk" || s.risk_level === "high" || s.risk_level === "critical");
  const readySystems = highRiskSystems.filter(s => getSystemReadiness(s.id).pct === 100);

  if (loading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading...</p>;

  return (
    <SubscriptionGate feature="EU Database Registration">
      <div className="space-y-8">
        <SectionHeader
          title="EU AI Database Registration"
          description="Prepare your high-risk AI systems for Article 71 registration in the EU public database. Track readiness per system."
        />

        <div className="rounded-lg p-4 border bg-muted/30 border-border/40">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Registration deadline: August 2027 (standalone) / August 2028 (embedded)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            High-risk AI providers and deployers must register systems in the EU public database before placing them on the market.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] gap-1">
              <ExternalLink className="h-3 w-3" />
              EU-DB-INTEROP-v1 format supported
            </Badge>
            <Badge variant="secondary" className="text-[10px]">Auto-submit when API available</Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{highRiskSystems.length}</p>
                  <p className="text-xs text-muted-foreground">High-Risk Systems</p>
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
                  <p className="text-2xl font-bold text-foreground">{readySystems.length}</p>
                  <p className="text-xs text-muted-foreground">Submission-Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{highRiskSystems.length - readySystems.length}</p>
                  <p className="text-xs text-muted-foreground">Incomplete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {highRiskSystems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No high-risk AI systems requiring EU database registration.</p>
              <p className="text-xs text-muted-foreground mt-1">Classify your systems in the AI Systems page to see registration requirements.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {highRiskSystems.map(sys => {
              const { completed, total, pct } = getSystemReadiness(sys.id);
              return (
                <Card key={sys.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">{sys.name}</CardTitle>
                        <Badge variant={pct === 100 ? "default" : "secondary"} className="text-[10px]">
                          {pct === 100 ? "Ready" : `${completed}/${total}`}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={pct === 100 ? "default" : "secondary"}
                          className="gap-2"
                          onClick={() => handleSubmitPreRegistration(sys)}
                          disabled={pct < 100}
                        >
                          <Send className="h-3.5 w-3.5" />
                          {pct === 100 ? "Pre-Register" : "Complete checklist"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleExport(sys)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export
                        </Button>
                      </div>
                    </div>
                    <Progress value={pct} className="mt-2 h-1.5" />
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {REGISTRATION_FIELDS.map(field => (
                      <div
                        key={field.id}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${readiness[sys.id]?.[field.id] ? "bg-primary/5" : "hover:bg-muted/30"}`}
                      >
                        <Checkbox
                          id={`${sys.id}-${field.id}`}
                          checked={!!readiness[sys.id]?.[field.id]}
                          onCheckedChange={() => toggleField(sys.id, field.id)}
                          className="mt-0.5"
                        />
                        <label htmlFor={`${sys.id}-${field.id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${readiness[sys.id]?.[field.id] ? "text-muted-foreground line-through" : "text-foreground"}`}>
                              {field.label}
                            </span>
                            <Badge variant="outline" className="text-[10px]">{field.article}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </SubscriptionGate>
  );
}
