import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Users,
  Database,
  Eye,
  Layers,
  Rocket,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AISystem {
  id: string;
  name: string;
  risk_level: string;
  status: string;
  eu_risk_tier: string;
}

interface ReadinessRecord {
  id: string;
  ai_system_id: string;
  org_id: string;
  status: string;
  operating_model_defined: boolean;
  operating_model_notes: string;
  risk_classified: boolean;
  risk_classification_notes: string;
  rule_coverage_verified: boolean;
  rule_coverage_notes: string;
  oversight_assigned: boolean;
  oversight_notes: string;
  data_governance_reviewed: boolean;
  data_governance_notes: string;
  transparency_documented: boolean;
  transparency_notes: string;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

const CHECKLIST_ITEMS = [
  {
    key: "operating_model_defined",
    notesKey: "operating_model_notes",
    label: "Operating Model Defined",
    description: "The AI system's operating model, decision boundaries, and intended use are formally documented.",
    icon: Layers,
    article: "EU AI Act Art. 9",
  },
  {
    key: "risk_classified",
    notesKey: "risk_classification_notes",
    label: "Risk Classification Complete",
    description: "System has been assessed and classified into the appropriate risk tier (Unacceptable, High, Limited, Minimal).",
    icon: AlertTriangle,
    article: "EU AI Act Art. 6",
  },
  {
    key: "rule_coverage_verified",
    notesKey: "rule_coverage_notes",
    label: "Rule Coverage Verified",
    description: "Governance rules are configured to monitor this system's event types, with severity thresholds defined.",
    icon: FileCheck,
    article: "EU AI Act Art. 14",
  },
  {
    key: "oversight_assigned",
    notesKey: "oversight_notes",
    label: "Human Oversight Assigned",
    description: "A responsible person or team has been designated for human review of this system's violations.",
    icon: Users,
    article: "EU AI Act Art. 14",
  },
  {
    key: "data_governance_reviewed",
    notesKey: "data_governance_notes",
    label: "Data Governance Reviewed",
    description: "Training data practices, bias mitigation, and data retention policies are documented and reviewed.",
    icon: Database,
    article: "EU AI Act Art. 10",
  },
  {
    key: "transparency_documented",
    notesKey: "transparency_notes",
    label: "Transparency Documented",
    description: "End-user disclosures, system documentation, and transparency obligations are fulfilled.",
    icon: Eye,
    article: "EU AI Act Art. 13",
  },
] as const;

type ChecklistKey = typeof CHECKLIST_ITEMS[number]["key"];
type NotesKey = typeof CHECKLIST_ITEMS[number]["notesKey"];

export default function CustomerDeploymentReadiness() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [readinessMap, setReadinessMap] = useState<Record<string, ReadinessRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const orgId = profile?.org_id;

  const loadData = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    try {
      const [sysRes, readRes] = await Promise.all([
        supabase.from("ai_systems").select("id, name, risk_level, status, eu_risk_tier").eq("org_id", orgId),
        supabase.from("deployment_readiness").select("*").eq("org_id", orgId),
      ]);

      setSystems((sysRes.data as AISystem[]) || []);

      const map: Record<string, ReadinessRecord> = {};
      ((readRes.data as ReadinessRecord[]) || []).forEach((r) => {
        map[r.ai_system_id] = r;
      });
      setReadinessMap(map);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getCheckedCount = (record?: ReadinessRecord) => {
    if (!record) return 0;
    return CHECKLIST_ITEMS.filter((item) => record[item.key as ChecklistKey]).length;
  };

  const getProgress = (record?: ReadinessRecord) => {
    return (getCheckedCount(record) / CHECKLIST_ITEMS.length) * 100;
  };

  const handleToggle = async (systemId: string, key: ChecklistKey, value: boolean) => {
    if (!orgId) return;
    setSaving(systemId);

    const existing = readinessMap[systemId];

    if (existing) {
      const allChecked = CHECKLIST_ITEMS.every((item) =>
        item.key === key ? value : existing[item.key as ChecklistKey]
      );
      const newStatus = allChecked ? "ready" : "in_progress";

      const { error } = await supabase
        .from("deployment_readiness")
        .update({
          [key]: value,
          status: newStatus,
          approved_at: allChecked ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", existing.id);

      if (!error) {
        setReadinessMap((prev) => ({
          ...prev,
          [systemId]: { ...existing, [key]: value, status: newStatus, approved_at: allChecked ? new Date().toISOString() : null },
        }));
        if (allChecked) {
          toast({ title: "System Ready", description: "All checklist items passed. This system is cleared for deployment." });
        }
      }
    } else {
      const { data, error } = await supabase
        .from("deployment_readiness")
        .insert({
          ai_system_id: systemId,
          org_id: orgId,
          [key]: value,
          status: "in_progress",
        } as any)
        .select()
        .single();

      if (!error && data) {
        setReadinessMap((prev) => ({ ...prev, [systemId]: data as unknown as ReadinessRecord }));
      }
    }
    setSaving(null);
  };

  const handleNotesChange = async (systemId: string, notesKey: NotesKey, value: string) => {
    const existing = readinessMap[systemId];
    if (!existing) return;

    // Optimistic update
    setReadinessMap((prev) => ({
      ...prev,
      [systemId]: { ...existing, [notesKey]: value },
    }));
  };

  const handleSaveNotes = async (systemId: string, notesKey: NotesKey) => {
    const existing = readinessMap[systemId];
    if (!existing) return;
    setSaving(systemId);

    await supabase
      .from("deployment_readiness")
      .update({ [notesKey]: existing[notesKey as keyof ReadinessRecord], updated_at: new Date().toISOString() } as any)
      .eq("id", existing.id);

    setSaving(null);
    toast({ title: "Notes saved" });
  };

  const statusBadge = (record?: ReadinessRecord) => {
    if (!record || record.status === "draft") return <Badge variant="outline">Not Started</Badge>;
    if (record.status === "ready") return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Ready</Badge>;
    return <Badge variant="secondary">In Progress</Badge>;
  };

  // KPIs
  const totalSystems = systems.length;
  const readySystems = systems.filter((s) => readinessMap[s.id]?.status === "ready").length;
  const inProgress = systems.filter((s) => readinessMap[s.id]?.status === "in_progress").length;
  const notStarted = totalSystems - readySystems - inProgress;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Pre-Deployment Readiness"
        description="Gate AI systems from going active until they pass a structured governance checklist"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <ContentCard title="">
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-card-foreground">{totalSystems}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Systems</p>
          </div>
        </ContentCard>
        <ContentCard title="">
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-emerald-600">{readySystems}</p>
            <p className="text-xs text-muted-foreground mt-1">Cleared</p>
          </div>
        </ContentCard>
        <ContentCard title="">
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-primary">{inProgress}</p>
            <p className="text-xs text-muted-foreground mt-1">In Review</p>
          </div>
        </ContentCard>
        <ContentCard title="">
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-muted-foreground">{notStarted}</p>
            <p className="text-xs text-muted-foreground mt-1">Not Started</p>
          </div>
        </ContentCard>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-card-foreground">Governance Before Deployment</p>
          <p className="text-muted-foreground mt-1">
            Each AI system must complete this 6-point readiness assessment before activation.
            This ensures operating models are defined, risks are classified, and human oversight
            is in place — addressing governance at the architecture level, not just the monitoring layer.
          </p>
        </div>
      </div>

      {/* Systems list */}
      {systems.length === 0 ? (
        <ContentCard title="No AI Systems">
          <p className="text-sm text-muted-foreground py-4 text-center">
            Register an AI system first to begin a readiness assessment.
          </p>
        </ContentCard>
      ) : (
        <div className="space-y-4">
          {systems.map((system) => {
            const record = readinessMap[system.id];
            const progress = getProgress(record);
            const isExpanded = expanded === system.id;
            const checked = getCheckedCount(record);

            return (
              <ContentCard key={system.id} title="">
                {/* System header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : system.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                        record?.status === "ready"
                          ? "bg-emerald-500/10"
                          : "bg-primary/10"
                      }`}>
                        {record?.status === "ready" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Rocket className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-card-foreground truncate">{system.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Risk: {system.risk_level || "unclassified"} · {checked}/{CHECKLIST_ITEMS.length} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {statusBadge(record)}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <Progress value={progress} className="h-1.5 mt-3" />
                </button>

                {/* Expanded checklist */}
                {isExpanded && (
                  <div className="mt-6 space-y-5 border-t border-border pt-5">
                    {CHECKLIST_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isChecked = record?.[item.key as ChecklistKey] ?? false;
                      const notes = (record?.[item.notesKey as NotesKey] as string) ?? "";

                      return (
                        <div key={item.key} className="space-y-2">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={`${system.id}-${item.key}`}
                              checked={isChecked}
                              onCheckedChange={(v) =>
                                handleToggle(system.id, item.key as ChecklistKey, !!v)
                              }
                              disabled={saving === system.id}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <Label
                                htmlFor={`${system.id}-${item.key}`}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Icon className="h-4 w-4 text-primary shrink-0" />
                                <span className={`font-medium text-sm ${isChecked ? "line-through text-muted-foreground" : "text-card-foreground"}`}>
                                  {item.label}
                                </span>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                                  {item.article}
                                </Badge>
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1 ml-6">
                                {item.description}
                              </p>
                              {record && (
                                <div className="mt-2 ml-6">
                                  <Textarea
                                    placeholder="Add evidence or notes..."
                                    value={notes}
                                    onChange={(e) =>
                                      handleNotesChange(system.id, item.notesKey as NotesKey, e.target.value)
                                    }
                                    onBlur={() => handleSaveNotes(system.id, item.notesKey as NotesKey)}
                                    className="text-xs min-h-[60px]"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {record?.status === "ready" && record.approved_at && (
                      <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <p className="text-xs text-emerald-700">
                          Cleared for deployment {formatDistanceToNow(new Date(record.approved_at), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </ContentCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
