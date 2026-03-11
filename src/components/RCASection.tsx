import { useState, useEffect, useCallback } from "react";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import {
  triggerRCA,
  fetchRCA,
  updateRCA,
  fetchRemediationActions,
  updateRemediationAction,
  fetchViolationPatterns,
} from "@/lib/api";
import {
  Brain,
  Lightbulb,
  ListChecks,
  Shield,
  TrendingUp,
  Loader2,
  RefreshCw,
  Edit3,
  Save,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RCASectionProps {
  violationId: string;
  canEdit?: boolean;
}

export function RCASection({ violationId, canEdit = false }: RCASectionProps) {
  const [rca, setRca] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState(false);
  const [humanDiagnosis, setHumanDiagnosis] = useState("");
  const [humanNotes, setHumanNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rcaData, actionsData, patternsData] = await Promise.all([
        fetchRCA(violationId),
        fetchRemediationActions(violationId),
        fetchViolationPatterns(violationId),
      ]);
      setRca(rcaData);
      setActions(actionsData);
      setPatterns(patternsData);
      if (rcaData) {
        setHumanDiagnosis(rcaData.human_diagnosis || "");
        setHumanNotes(rcaData.human_notes || "");
      }
    } catch {
      // silent fail on initial load
    } finally {
      setLoading(false);
    }
  }, [violationId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await triggerRCA(violationId);
      toast({ title: "Analysis Complete", description: "AI root cause analysis has been generated." });
      await loadData();
    } catch (err: any) {
      toast({ title: "Analysis Failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveHumanInput = async () => {
    if (!rca) return;
    setSavingEdit(true);
    try {
      const updated = await updateRCA(rca.id, {
        human_diagnosis: humanDiagnosis,
        human_notes: humanNotes,
        status: "human_reviewed",
      });
      setRca(updated);
      setEditingDiagnosis(false);
      toast({ title: "Saved", description: "Human review saved successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleAction = async (action: any) => {
    const newStatus = action.status === "completed" ? "pending" : "completed";
    try {
      const updated = await updateRemediationAction(action.id, {
        status: newStatus,
        completed_at: newStatus === "completed" ? new Date().toISOString() : null,
      });
      setActions((prev) => prev.map((a) => (a.id === action.id ? updated : a)));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case "critical": return "text-red-400";
      case "high": return "text-orange-400";
      case "medium": return "text-yellow-400";
      default: return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <ContentCard icon={Brain} title="Root Cause Analysis">
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading analysis…
        </div>
      </ContentCard>
    );
  }

  // No RCA yet — show trigger button
  if (!rca) {
    return (
      <ContentCard icon={Brain} title="Root Cause Analysis">
        <div className="text-center py-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            No root cause analysis has been performed yet. Run AI-powered diagnosis to identify
            the root cause, get recommendations, and detect patterns.
          </p>
          <Button onClick={handleAnalyze} disabled={analyzing} className="gap-2">
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {analyzing ? "Analyzing…" : "Run AI Analysis"}
          </Button>
        </div>
      </ContentCard>
    );
  }

  return (
    <div className="space-y-base">
      {/* AI Diagnosis */}
      <ContentCard icon={Brain} title="AI Diagnosis">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {rca.status === "human_reviewed" ? "Human Reviewed" : "AI Generated"}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleAnalyze} disabled={analyzing} className="gap-1 text-xs">
              {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Re-analyze
            </Button>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-sm text-card-foreground/80 whitespace-pre-wrap">{rca.ai_diagnosis}</p>
          </div>

          {/* Human diagnosis overlay */}
          {canEdit && (
            <div className="border-t border-border/40 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Edit3 className="h-3 w-3" /> Human Validation
                </span>
                {!editingDiagnosis && (
                  <Button variant="ghost" size="sm" onClick={() => setEditingDiagnosis(true)} className="text-xs">
                    Edit
                  </Button>
                )}
              </div>
              {editingDiagnosis ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add your diagnosis or corrections to the AI analysis…"
                    value={humanDiagnosis}
                    onChange={(e) => setHumanDiagnosis(e.target.value)}
                    rows={3}
                  />
                  <Textarea
                    placeholder="Additional notes…"
                    value={humanNotes}
                    onChange={(e) => setHumanNotes(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditingDiagnosis(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSaveHumanInput} disabled={savingEdit} className="gap-1">
                      {savingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      Save
                    </Button>
                  </div>
                </div>
              ) : rca.human_diagnosis ? (
                <p className="text-sm text-card-foreground/80 whitespace-pre-wrap bg-muted/30 rounded-md p-3">
                  {rca.human_diagnosis}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">No human input yet.</p>
              )}
            </div>
          )}
        </div>
      </ContentCard>

      {/* Recommendations */}
      <ContentCard icon={Lightbulb} title="Recommendations">
        <p className="text-sm text-card-foreground/80 whitespace-pre-wrap">{rca.ai_recommendations}</p>
      </ContentCard>

      {/* Remediation Checklist */}
      {actions.length > 0 && (
        <ContentCard icon={ListChecks} title="Remediation Actions">
          <div className="space-y-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border border-border/40 transition-colors",
                  action.status === "completed" && "bg-muted/20 opacity-70"
                )}
              >
                <Checkbox
                  checked={action.status === "completed"}
                  onCheckedChange={() => handleToggleAction(action)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", action.status === "completed" && "line-through")}>
                    {action.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                </div>
                <Badge variant="outline" className={cn("text-xs shrink-0", priorityColor(action.priority))}>
                  {action.status === "completed" ? "Done" : action.status}
                </Badge>
              </div>
            ))}
            <div className="text-xs text-muted-foreground text-right">
              {actions.filter((a) => a.status === "completed").length}/{actions.length} completed
            </div>
          </div>
        </ContentCard>
      )}

      {/* Suggested Rule Changes */}
      {rca.ai_suggested_rules?.length > 0 && (
        <ContentCard icon={Shield} title="Suggested Rule Changes">
          <div className="space-y-3">
            {rca.ai_suggested_rules.map((rule: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border border-border/40 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("text-xs", {
                      "text-green-400": rule.action === "create",
                      "text-yellow-400": rule.action === "modify",
                      "text-red-400": rule.action === "disable",
                    })}
                  >
                    {rule.action}
                  </Badge>
                  <span className="text-sm font-medium">{rule.name}</span>
                  <Badge variant="outline" className={cn("text-xs ml-auto", priorityColor(rule.severity))}>
                    {rule.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{rule.description}</p>
                <p className="text-xs text-card-foreground/60 italic">{rule.reason}</p>
              </div>
            ))}
          </div>
        </ContentCard>
      )}

      {/* Pattern Detection */}
      {patterns.length > 0 && (
        <ContentCard icon={TrendingUp} title="Detected Patterns">
          <div className="space-y-3">
            {patterns.map((pattern) => (
              <div key={pattern.id} className="p-3 rounded-lg border border-border/40 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium">{pattern.pattern_name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {pattern.frequency} occurrences
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{pattern.description}</p>
                <p className="text-xs text-card-foreground/50">
                  First seen: {new Date(pattern.first_seen).toLocaleDateString()} · 
                  Last seen: {new Date(pattern.last_seen).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </ContentCard>
      )}
    </div>
  );
}
