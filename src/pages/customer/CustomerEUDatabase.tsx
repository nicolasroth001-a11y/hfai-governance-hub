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
  Globe, Download, Cpu, CheckCircle, AlertTriangle, Database, ExternalLink
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

  const handleExportPreRegistration = (system: any) => {
    const fields = readiness[system.id] || {};
    const doc = {
      document_type: "EU AI Database Pre-Registration Package",
      article: "Article 71 — EU database for high-risk AI systems",
      generated_at: new Date().toISOString(),
      platform: "HFAI — Human-First AI Governance",
      ai_system: {
        name: system.name,
        provider: system.provider || "To be completed",
        model_type: system.model_type || "To be completed",
        version: system.version || "1.0",
        eu_risk_tier: system.eu_risk_tier || "not_classified",
        description: system.description || "To be completed",
        transparency_uri: system.transparency_uri || "",
      },
      registration_checklist: REGISTRATION_FIELDS.map(f => ({
        field: f.label,
        article: f.article,
        status: fields[f.id] ? "Ready" : "Incomplete",
        description: f.description,
      })),
      readiness_summary: getSystemReadiness(system.id),
      next_steps: "Complete all checklist items, then submit via the EU AI Database portal when it becomes available.",
    };

    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eu-database-prep-${system.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Pre-registration package exported", description: `Package for ${system.name} downloaded.` });
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

        {/* Timeline */}
        <div className="rounded-lg p-4 border bg-muted/30 border-border/40">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Registration deadline: August 2027 (standalone) / August 2028 (embedded)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            High-risk AI providers and deployers must register systems in the EU public database before placing them on the market. Start preparation now.
          </p>
        </div>

        {/* KPIs */}
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
                  <p className="text-xs text-muted-foreground">Registration-Ready</p>
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

        {/* Per-System Checklists */}
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleExportPreRegistration(sys)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Export Package
                      </Button>
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
