import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Shield, CheckCircle2, AlertTriangle, Loader2, ChevronDown, ChevronUp,
  Layers, Users, Database, Eye, FileCheck, Settings, Brain, Lock, BarChart3, RefreshCw
} from "lucide-react";

interface AISystem {
  id: string;
  name: string;
  risk_level: string;
}

/* ISO 42001 Annex A control groups mapped to HFAI features */
const ANNEX_A_CONTROLS = [
  {
    id: "A.2",
    title: "AI Policies",
    icon: FileCheck,
    controls: [
      { id: "A.2.2", label: "AI Policy", hfaiFeature: "Governance rules engine", covered: true },
      { id: "A.2.3", label: "AI Roles & Responsibilities", hfaiFeature: "Role-based access (admin/reviewer/customer)", covered: true },
      { id: "A.2.4", label: "Resources for AI", hfaiFeature: "AI system registry", covered: true },
    ],
  },
  {
    id: "A.3",
    title: "Internal Organization",
    icon: Users,
    controls: [
      { id: "A.3.2", label: "Roles within AIMS", hfaiFeature: "HITL reviewer assignment", covered: true },
      { id: "A.3.3", label: "Duties of Top Management", hfaiFeature: "Deployment readiness sign-off", covered: true },
    ],
  },
  {
    id: "A.4",
    title: "Resources for AI System",
    icon: Database,
    controls: [
      { id: "A.4.3", label: "AI System Lifecycle Processes", hfaiFeature: "Model versioning & audit trail", covered: true },
      { id: "A.4.4", label: "Tools and Frameworks", hfaiFeature: "SDK / Proxy integration", covered: true },
      { id: "A.4.5", label: "Data Management", hfaiFeature: "Data lineage module", covered: true },
      { id: "A.4.6", label: "System & Data Quality", hfaiFeature: "Bias auditing & drift detection", covered: true },
    ],
  },
  {
    id: "A.5",
    title: "Assessing AI System Impacts",
    icon: AlertTriangle,
    controls: [
      { id: "A.5.2", label: "AI Impact Assessment", hfaiFeature: "AI Impact Assessment module", covered: true },
      { id: "A.5.3", label: "Documenting Impact Results", hfaiFeature: "Exportable impact reports", covered: true },
      { id: "A.5.4", label: "Systemic Bias Assessment", hfaiFeature: "Bias & fairness audits", covered: true },
    ],
  },
  {
    id: "A.6",
    title: "AI System Lifecycle",
    icon: RefreshCw,
    controls: [
      { id: "A.6.2.2", label: "Design & Development", hfaiFeature: "AI system registry with metadata", covered: true },
      { id: "A.6.2.3", label: "Verification & Validation", hfaiFeature: "Scheduled audits", covered: true },
      { id: "A.6.2.4", label: "Deployment & Use", hfaiFeature: "Deployment readiness checklist", covered: true },
      { id: "A.6.2.5", label: "Operation & Monitoring", hfaiFeature: "Real-time event monitoring + drift", covered: true },
      { id: "A.6.2.6", label: "Retirement", hfaiFeature: "System status management", covered: true },
    ],
  },
  {
    id: "A.7",
    title: "Data for AI Systems",
    icon: Layers,
    controls: [
      { id: "A.7.2", label: "Data Quality for AI", hfaiFeature: "Data lineage quality scores", covered: true },
      { id: "A.7.3", label: "Data Provenance", hfaiFeature: "Data lineage records", covered: true },
      { id: "A.7.4", label: "Data Preparation", hfaiFeature: "Collection method & consent tracking", covered: true },
    ],
  },
  {
    id: "A.8",
    title: "Information for Interested Parties",
    icon: Eye,
    controls: [
      { id: "A.8.2", label: "Transparency of AI Systems", hfaiFeature: "Transparency documentation (Art. 13)", covered: true },
      { id: "A.8.3", label: "Provision of Information", hfaiFeature: "Technical docs export (Annex IV)", covered: true },
      { id: "A.8.4", label: "AI System Reporting", hfaiFeature: "Incident reporting module", covered: true },
    ],
  },
  {
    id: "A.9",
    title: "Use of AI Systems",
    icon: Brain,
    controls: [
      { id: "A.9.2", label: "Intended Use Documentation", hfaiFeature: "Operating model in deployment readiness", covered: true },
      { id: "A.9.3", label: "Misuse Prevention", hfaiFeature: "Prohibited practices scanner (Art. 5)", covered: true },
      { id: "A.9.4", label: "Human Oversight", hfaiFeature: "HITL review authority", covered: true },
    ],
  },
  {
    id: "A.10",
    title: "Third-Party & Customer Relationships",
    icon: Settings,
    controls: [
      { id: "A.10.2", label: "Supplier Assessment", hfaiFeature: "Vendor risk assessments", covered: true },
      { id: "A.10.3", label: "Third-Party Monitoring", hfaiFeature: "Connected provider monitoring", covered: true },
    ],
  },
];

const ALL_CONTROLS = ANNEX_A_CONTROLS.flatMap((g) => g.controls);

export default function CustomerISO42001Controls() {
  const { profile } = useAuth();
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(ANNEX_A_CONTROLS[0].id);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("iso42001_ack") || "{}");
    } catch { return {}; }
  });

  useEffect(() => {
    if (!profile?.org_id) { setLoading(false); return; }
    supabase.from("ai_systems").select("id, name, risk_level").eq("org_id", profile.org_id)
      .then(({ data }) => { setSystems(data || []); setLoading(false); });
  }, [profile?.org_id]);

  const toggleAck = (controlId: string) => {
    setAcknowledged((prev) => {
      const next = { ...prev, [controlId]: !prev[controlId] };
      localStorage.setItem("iso42001_ack", JSON.stringify(next));
      return next;
    });
  };

  const ackCount = ALL_CONTROLS.filter((c) => acknowledged[c.id]).length;
  const coveredCount = ALL_CONTROLS.filter((c) => c.covered).length;
  const progress = (ackCount / ALL_CONTROLS.length) * 100;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="ISO 42001 Control Mapping" description="Map HFAI features to ISO/IEC 42001 Annex A controls and track organizational readiness." />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ContentCard title="">
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-card-foreground">{ALL_CONTROLS.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Controls</p>
          </div>
        </ContentCard>
        <ContentCard title="">
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-emerald-600">{coveredCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Covered by HFAI</p>
          </div>
        </ContentCard>
        <ContentCard title="">
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-primary">{ackCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Acknowledged</p>
          </div>
        </ContentCard>
        <ContentCard title="">
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-muted-foreground">{Math.round(progress)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Review Progress</p>
          </div>
        </ContentCard>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Info */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-card-foreground">ISO/IEC 42001:2023 — AI Management System</p>
          <p className="text-muted-foreground mt-1">
            This mapping shows how HFAI's built-in capabilities address each Annex A control.
            Acknowledge each control to track your organization's review status.
            {systems.length > 0 && ` Covering ${systems.length} registered AI system${systems.length > 1 ? "s" : ""}.`}
          </p>
        </div>
      </div>

      {/* Control groups */}
      <div className="space-y-3">
        {ANNEX_A_CONTROLS.map((group) => {
          const Icon = group.icon;
          const isExpanded = expanded === group.id;
          const groupAck = group.controls.filter((c) => acknowledged[c.id]).length;

          return (
            <ContentCard key={group.id} title="">
              <button onClick={() => setExpanded(isExpanded ? null : group.id)} className="w-full text-left">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-card-foreground">{group.id} — {group.title}</p>
                      <p className="text-xs text-muted-foreground">{groupAck}/{group.controls.length} acknowledged</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={groupAck === group.controls.length ? "default" : "outline"} className={groupAck === group.controls.length ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""}>
                      {groupAck === group.controls.length ? "Complete" : `${groupAck}/${group.controls.length}`}
                    </Badge>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  {group.controls.map((ctrl) => (
                    <div key={ctrl.id} className="flex items-start gap-3">
                      <Checkbox id={ctrl.id} checked={!!acknowledged[ctrl.id]} onCheckedChange={() => toggleAck(ctrl.id)} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={ctrl.id} className="cursor-pointer">
                          <span className="font-medium text-sm text-card-foreground">{ctrl.id}: {ctrl.label}</span>
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          {ctrl.covered ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-1.5 py-0">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Covered
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Gap</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">→ {ctrl.hfaiFeature}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ContentCard>
          );
        })}
      </div>
    </div>
  );
}
