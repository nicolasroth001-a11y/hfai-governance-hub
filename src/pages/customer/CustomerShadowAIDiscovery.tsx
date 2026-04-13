import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, Eye, EyeOff, AlertTriangle, CheckCircle, Cpu, Plus,
  Radar, Shield, Activity, TrendingUp, Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DiscoveredSystem {
  identifier: string;
  provider: string | null;
  model: string | null;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  registered: boolean;
  registeredSystemId?: string;
}

export default function CustomerShadowAIDiscovery() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [discovered, setDiscovered] = useState<DiscoveredSystem[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const orgId = profile?.org_id;

  useEffect(() => {
    if (!orgId) return;
    runDiscovery();
  }, [orgId]);

  async function runDiscovery() {
    if (!orgId) return;
    setScanning(true);
    try {
      // Fetch all registered AI systems
      const { data: systems } = await supabase
        .from("ai_systems")
        .select("id, name, provider, model_type")
        .eq("org_id", orgId);

      const registeredNames = new Set(
        (systems || []).map((s) => s.name.toLowerCase().trim())
      );
      const registeredProviders = new Set(
        (systems || []).flatMap((s) =>
          [s.provider, s.model_type].filter(Boolean).map((v) => v!.toLowerCase().trim())
        )
      );

      // Fetch all events and extract unique ai_system_ids + metadata patterns
      const { data: events } = await supabase
        .from("ai_events")
        .select("ai_system_id, event_type, metadata, payload, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(1000);

      // Group by ai_system_id or extracted identifiers from metadata
      const systemMap = new Map<string, {
        identifier: string;
        provider: string | null;
        model: string | null;
        firstSeen: string;
        lastSeen: string;
        count: number;
        linkedSystemId: string | null;
      }>();

      for (const evt of events || []) {
        const meta = evt.metadata as Record<string, unknown> | null;
        const payload = evt.payload as Record<string, unknown> | null;

        // Extract identifiers from event data
        const model = (meta?.model || payload?.model || meta?.model_id || "") as string;
        const provider = (meta?.provider || payload?.provider || "") as string;
        const sysId = evt.ai_system_id;

        // Create a unique key for grouping
        const key = sysId || `${provider}:${model}`.toLowerCase() || evt.event_type;
        if (!key || key === ":") continue;

        const existing = systemMap.get(key);
        if (existing) {
          existing.count++;
          if (evt.created_at < existing.firstSeen) existing.firstSeen = evt.created_at;
          if (evt.created_at > existing.lastSeen) existing.lastSeen = evt.created_at;
          if (!existing.model && model) existing.model = model;
          if (!existing.provider && provider) existing.provider = provider;
        } else {
          systemMap.set(key, {
            identifier: model || provider || sysId || evt.event_type,
            provider: provider || null,
            model: model || null,
            firstSeen: evt.created_at,
            lastSeen: evt.created_at,
            count: 1,
            linkedSystemId: sysId,
          });
        }
      }

      // Determine which are registered vs shadow
      const results: DiscoveredSystem[] = [];
      const regIds = new Set<string>();

      for (const [key, entry] of systemMap) {
        const nameMatch = registeredNames.has(entry.identifier.toLowerCase().trim());
        const providerMatch = entry.provider && registeredProviders.has(entry.provider.toLowerCase().trim());
        const modelMatch = entry.model && registeredProviders.has(entry.model.toLowerCase().trim());
        const isLinked = entry.linkedSystemId && systems?.some(s => s.id === entry.linkedSystemId);

        const registered = !!(nameMatch || providerMatch || modelMatch || isLinked);

        if (registered) regIds.add(key);

        results.push({
          identifier: entry.identifier,
          provider: entry.provider,
          model: entry.model,
          firstSeen: entry.firstSeen,
          lastSeen: entry.lastSeen,
          eventCount: entry.count,
          registered,
          registeredSystemId: isLinked ? entry.linkedSystemId! : undefined,
        });
      }

      setRegisteredIds(regIds);
      setDiscovered(results.sort((a, b) => {
        // Unregistered first, then by event count
        if (a.registered !== b.registered) return a.registered ? 1 : -1;
        return b.eventCount - a.eventCount;
      }));
    } catch (err) {
      console.error(err);
      toast({ title: "Discovery failed", description: "Could not scan for shadow AI systems.", variant: "destructive" });
    } finally {
      setLoading(false);
      setScanning(false);
    }
  }

  async function handleRegister(system: DiscoveredSystem) {
    if (!orgId) return;
    setRegisteringId(system.identifier);
    try {
      const { error } = await supabase.from("ai_systems").insert({
        org_id: orgId,
        name: system.identifier,
        provider: system.provider || "",
        model_type: system.model || "",
        status: "registered",
        risk_level: "medium",
      });
      if (error) throw error;

      toast({ title: "System registered", description: `${system.identifier} has been added to your AI inventory.` });

      // Refresh discovery
      await runDiscovery();
    } catch (err) {
      console.error(err);
      toast({ title: "Registration failed", variant: "destructive" });
    } finally {
      setRegisteringId(null);
    }
  }

  const unregistered = useMemo(() => discovered.filter(d => !d.registered), [discovered]);
  const registered = useMemo(() => discovered.filter(d => d.registered), [discovered]);
  const filtered = useMemo(() => {
    if (!search) return discovered;
    const q = search.toLowerCase();
    return discovered.filter(d =>
      d.identifier.toLowerCase().includes(q) ||
      d.provider?.toLowerCase().includes(q) ||
      d.model?.toLowerCase().includes(q)
    );
  }, [discovered, search]);

  return (
    <SubscriptionGate feature="Shadow AI Discovery">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Radar className="h-6 w-6 text-primary" />
              Shadow AI Discovery
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Auto-detect unregistered AI systems from your event telemetry
            </p>
          </div>
          <Button onClick={runDiscovery} disabled={scanning} size="sm" className="gap-2">
            <Activity className="h-4 w-4" />
            {scanning ? "Scanning…" : "Re-scan"}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <EyeOff className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unregistered.length}</p>
                  <p className="text-xs text-muted-foreground">Shadow Systems</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{registered.length}</p>
                  <p className="text-xs text-muted-foreground">Registered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{discovered.length}</p>
                  <p className="text-xs text-muted-foreground">Total Detected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {discovered.length > 0
                      ? Math.round((registered.length / discovered.length) * 100)
                      : 100}%
                  </p>
                  <p className="text-xs text-muted-foreground">Coverage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert if shadow systems found */}
        {unregistered.length > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    {unregistered.length} unregistered AI system{unregistered.length !== 1 ? "s" : ""} detected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    These systems are generating events but are not in your AI inventory.
                    Under EU AI Act Article 9, all high-risk AI systems must be formally registered and risk-classified.
                    Register them below to bring them under governance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discovered systems…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Discovery Results */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Radar className="h-8 w-8 text-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">Scanning event telemetry…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium">No shadow AI systems detected</p>
              <p className="text-xs text-muted-foreground mt-1">
                All detected AI usage is linked to registered systems.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((system) => (
              <Card
                key={system.identifier}
                className={`transition-colors ${!system.registered ? "border-destructive/20 bg-destructive/[0.02]" : ""}`}
              >
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        system.registered ? "bg-primary/10" : "bg-destructive/10"
                      }`}>
                        <Cpu className={`h-4 w-4 ${system.registered ? "text-primary" : "text-destructive"}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold truncate">{system.identifier}</p>
                          {system.registered ? (
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                              <CheckCircle className="h-3 w-3 mr-1" /> Registered
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">
                              <EyeOff className="h-3 w-3 mr-1" /> Shadow
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                          {system.provider && <span>Provider: {system.provider}</span>}
                          {system.model && <span>Model: {system.model}</span>}
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" /> {system.eventCount} events
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Last seen {formatDistanceToNow(new Date(system.lastSeen), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!system.registered && (
                      <Button
                        size="sm"
                        onClick={() => handleRegister(system)}
                        disabled={registeringId === system.identifier}
                        className="gap-1 shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {registeringId === system.identifier ? "Registering…" : "Register"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* What is Shadow AI */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              What is Shadow AI?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Shadow AI</strong> refers to AI systems, models, or services being used
              within your organization that haven't been formally registered in your governance inventory. This is a major
              compliance risk — under the <strong className="text-foreground">EU AI Act (Article 9)</strong>, all high-risk
              AI systems must be inventoried, risk-classified, and subject to oversight.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Shadow AI typically emerges when teams adopt AI tools (like ChatGPT, Copilot, or custom models) without
              going through formal approval processes. Without visibility, these systems operate outside your compliance
              boundary, creating regulatory exposure.
            </p>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">How Shadow AI Discovery Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This tool automatically scans your event telemetry to find AI systems that are generating events but
              aren't in your registered inventory. Here's the process:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Activity,
                  title: "1. Telemetry Scan",
                  desc: "We analyze all AI events flowing through your integration, extracting unique system identifiers, provider names, and model types from event metadata.",
                },
                {
                  icon: Radar,
                  title: "2. Cross-Reference",
                  desc: "Each detected system is compared against your registered AI inventory. Systems that don't match any registered entry are flagged as 'Shadow AI'.",
                },
                {
                  icon: Shield,
                  title: "3. One-Click Register",
                  desc: "Shadow systems can be instantly added to your AI inventory with a single click, bringing them under full governance and compliance coverage.",
                },
              ].map((step) => (
                <div key={step.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{step.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              💡 Tip: Run a scan regularly (we recommend weekly) to catch newly adopted AI tools before they create compliance gaps.
            </p>
          </CardContent>
        </Card>
      </div>
    </SubscriptionGate>
  );
}
