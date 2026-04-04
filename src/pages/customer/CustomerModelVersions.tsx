import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import {
  GitBranch,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface AISystem {
  id: string;
  name: string;
}

interface VersionRecord {
  id: string;
  ai_system_id: string;
  version_label: string;
  change_description: string;
  changed_by: string | null;
  previous_values: Record<string, any>;
  new_values: Record<string, any>;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export default function CustomerModelVersions() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const orgId = profile?.org_id;

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [sysRes, verRes] = await Promise.all([
        supabase.from("ai_systems").select("id, name").eq("org_id", orgId),
        supabase.from("ai_system_versions").select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
      ]);
      setSystems((sysRes.data as AISystem[]) || []);
      setVersions((verRes.data as VersionRecord[]) || []);
    } catch {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = selectedSystem === "all" ? versions : versions.filter((v) => v.ai_system_id === selectedSystem);

  const renderDiff = (prev: Record<string, any>, next: Record<string, any>) => {
    const allKeys = [...new Set([...Object.keys(prev || {}), ...Object.keys(next || {})])];
    const changes = allKeys.filter((k) => JSON.stringify(prev?.[k]) !== JSON.stringify(next?.[k]));
    if (changes.length === 0) return <p className="text-xs text-card-foreground/40 italic">No field changes recorded</p>;
    return (
      <div className="space-y-1.5">
        {changes.map((key) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="font-mono text-card-foreground/60 min-w-[120px]">{key}</span>
            <span className="text-destructive/70 line-through">{JSON.stringify(prev?.[key]) || "—"}</span>
            <ArrowRight className="h-3 w-3 text-card-foreground/30 shrink-0" />
            <span className="text-emerald-600">{JSON.stringify(next?.[key]) || "—"}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <SubscriptionGate feature="Model Version History">
      <div className="space-y-6">
        <SectionHeader title={t("customerModelVersions.title")} description={t("customerModelVersions.description")} />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Total Changes</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">{filtered.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Approved</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{filtered.filter((v) => v.approved_at).length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-card-foreground/5">
            <p className="text-xs text-card-foreground/50 font-medium">Pending Approval</p>
            <p className="text-2xl font-bold text-warning mt-1">{filtered.filter((v) => !v.approved_at).length}</p>
          </div>
        </div>

        <Select value={selectedSystem} onValueChange={setSelectedSystem}>
          <SelectTrigger className="w-[200px] bg-card border-card-foreground/10">
            <SelectValue placeholder="Filter by system" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Systems</SelectItem>
            {systems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>

        {loading ? (
          <p className="text-sm text-card-foreground/50 text-center py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <ContentCard icon={GitBranch} title="No Version History">
            <p className="text-sm text-card-foreground/50">Changes to AI system configurations will appear here automatically.</p>
          </ContentCard>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-card-foreground/10" />
            <div className="space-y-4">
              {filtered.map((v) => {
                const system = systems.find((s) => s.id === v.ai_system_id);
                return (
                  <div key={v.id} className="relative pl-12">
                    <div className="absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 border-primary bg-background" />
                    <div className="bg-card rounded-xl border border-card-foreground/5 p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="text-sm font-medium text-card-foreground">
                            {v.version_label || "Configuration Change"}
                          </p>
                          <p className="text-xs text-card-foreground/50 mt-0.5">
                            {system?.name || "Unknown"} · {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {v.approved_at ? (
                            <Badge variant="default" className="text-xs gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Approved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Pending</Badge>
                          )}
                        </div>
                      </div>
                      {v.change_description && (
                        <p className="text-xs text-card-foreground/60 mb-3">{v.change_description}</p>
                      )}
                      {renderDiff(v.previous_values, v.new_values)}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-card-foreground/5">
                        <span className="text-xs text-card-foreground/40 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {format(new Date(v.created_at), "MMM d, yyyy HH:mm")}
                        </span>
                        {v.approved_at && (
                          <span className="text-xs text-card-foreground/40 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Approved {format(new Date(v.approved_at), "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SubscriptionGate>
  );
}
