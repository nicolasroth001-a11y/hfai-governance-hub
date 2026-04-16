import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Slack, Webhook, Cloud, MessageSquare, Plus, Trash2, Send, CheckCircle2, AlertCircle, Ticket, Snowflake, Activity, Siren, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { TIER_LEVEL } from "@/lib/stripe-config";

type IntegrationType = "slack" | "teams" | "webhook_custom" | "s3" | "jira" | "snowflake" | "datadog" | "pagerduty";

const CATALOG: Array<{
  type: IntegrationType;
  name: string;
  description: string;
  icon: any;
  minTier: "starter" | "pro" | "enterprise" | "sovereign";
  fields: Array<{ key: string; label: string; placeholder: string; required?: boolean; type?: string }>;
}> = [
  {
    type: "slack", name: "Slack", icon: Slack, minTier: "pro",
    description: "Real-time violation alerts to any Slack channel via incoming webhook.",
    fields: [
      { key: "webhook_url", label: "Slack Incoming Webhook URL", placeholder: "https://hooks.slack.com/services/…", required: true },
      { key: "channel", label: "Channel override (optional)", placeholder: "#ai-governance" },
    ],
  },
  {
    type: "teams", name: "Microsoft Teams", icon: MessageSquare, minTier: "pro",
    description: "Push compliance alerts to a Teams channel via Incoming Webhook connector.",
    fields: [
      { key: "webhook_url", label: "Teams Incoming Webhook URL", placeholder: "https://outlook.office.com/webhook/…", required: true },
    ],
  },
  {
    type: "webhook_custom", name: "Custom Webhook", icon: Webhook, minTier: "pro",
    description: "POST violation events to your own HTTPS endpoint. Includes optional HMAC signature.",
    fields: [
      { key: "url", label: "Endpoint URL", placeholder: "https://your-api.example.com/hfai", required: true },
      { key: "secret", label: "Shared secret (optional)", placeholder: "your-secret-token" },
    ],
  },
  {
    type: "s3", name: "AWS S3 Audit Export", icon: Cloud, minTier: "sovereign",
    description: "Nightly export of audit trails and compliance evidence to your own S3 bucket.",
    fields: [
      { key: "bucket", label: "Bucket name", placeholder: "my-compliance-evidence", required: true },
      { key: "region", label: "AWS region", placeholder: "us-east-1", required: true },
      { key: "access_key_id", label: "AWS Access Key ID", placeholder: "AKIA…", required: true },
      { key: "secret_access_key", label: "AWS Secret Access Key", placeholder: "••••••••", required: true, type: "password" },
      { key: "prefix", label: "Object key prefix", placeholder: "hfai/" },
    ],
  },
  {
    type: "jira", name: "Jira", icon: Ticket, minTier: "pro",
    description: "Auto-create Jira issues from violations so engineering can remediate from their backlog.",
    fields: [
      { key: "base_url", label: "Jira site URL", placeholder: "https://yourco.atlassian.net", required: true },
      { key: "email", label: "Atlassian account email", placeholder: "you@company.com", required: true },
      { key: "api_token", label: "API token", placeholder: "••••••••", required: true, type: "password" },
      { key: "project_key", label: "Project key", placeholder: "AIGOV", required: true },
      { key: "issue_type", label: "Issue type", placeholder: "Task" },
      { key: "priority", label: "Priority (optional)", placeholder: "High" },
    ],
  },
  {
    type: "snowflake", name: "Snowflake", icon: Snowflake, minTier: "enterprise",
    description: "Nightly auto-export of violations, reviews, audit logs, and rules to your Snowflake warehouse.",
    fields: [
      { key: "account", label: "Account identifier", placeholder: "abc12345.us-east-1", required: true },
      { key: "warehouse", label: "Warehouse", placeholder: "COMPUTE_WH", required: true },
      { key: "database", label: "Database", placeholder: "GOVERNANCE", required: true },
      { key: "schema", label: "Schema", placeholder: "HFAI", required: true },
      { key: "username", label: "Username", placeholder: "HFAI_SVC", required: true },
      { key: "password", label: "Password", placeholder: "••••••••", required: true, type: "password" },
      { key: "role", label: "Role (optional)", placeholder: "SYSADMIN" },
    ],
  },
  {
    type: "datadog", name: "Datadog", icon: Activity, minTier: "enterprise",
    description: "Stream violations to Datadog as events with severity tags so SREs see AI alongside infra.",
    fields: [
      { key: "api_key", label: "Datadog API key", placeholder: "••••••••", required: true, type: "password" },
      { key: "site", label: "Datadog site", placeholder: "datadoghq.com (or eu, us3, us5)" },
    ],
  },
  {
    type: "pagerduty", name: "PagerDuty", icon: Siren, minTier: "enterprise",
    description: "Trigger PagerDuty incidents on critical violations — wake the on-call engineer when AI goes off the rails.",
    fields: [
      { key: "routing_key", label: "Events API v2 integration key", placeholder: "32-char routing key", required: true, type: "password" },
    ],
  },
];

const TRIGGER_OPTIONS = [
  { value: "new_violation", label: "Any new violation" },
  { value: "high_severity", label: "High severity" },
  { value: "critical", label: "Critical only" },
  { value: "pattern_detected", label: "Pattern detected" },
];

export default function CustomerIntegrations() {
  const { subscription } = useAuth();
  const currentLevel = TIER_LEVEL[subscription.tier ?? "free"];
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<IntegrationType | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [formConfig, setFormConfig] = useState<Record<string, string>>({});
  const [formName, setFormName] = useState("");
  const [formTrigger, setFormTrigger] = useState("high_severity");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("integrations").select("*").order("created_at", { ascending: false });
    setIntegrations(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openConfigure = (type: IntegrationType, existing?: any) => {
    setOpen(type);
    setEditing(existing ?? null);
    setFormConfig(existing?.config ?? {});
    setFormName(existing?.display_name ?? CATALOG.find(c => c.type === type)?.name ?? "");
    setFormTrigger(existing?.trigger_events?.[0] ?? "high_severity");
  };

  const save = async () => {
    if (!open) return;
    const meta = CATALOG.find(c => c.type === open)!;
    for (const f of meta.fields) {
      if (f.required && !formConfig[f.key]) {
        toast({ title: "Missing field", description: `${f.label} is required.`, variant: "destructive" });
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        integration_type: open, display_name: formName, config: formConfig,
        trigger_events: [formTrigger], enabled: true,
      };
      if (editing) {
        const { error } = await (supabase as any).from("integrations").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        // include org_id for RLS
        const { data: profile } = await supabase.from("profiles").select("org_id").maybeSingle();
        if (!profile?.org_id) throw new Error("No organization found.");
        const { error } = await (supabase as any).from("integrations").insert({ ...payload, org_id: profile.org_id });
        if (error) throw error;
      }
      toast({ title: "Saved", description: `${meta.name} integration ${editing ? "updated" : "added"}.` });
      setOpen(null); setEditing(null);
      load();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const toggle = async (i: any) => {
    await (supabase as any).from("integrations").update({ enabled: !i.enabled }).eq("id", i.id);
    load();
  };

  const remove = async (i: any) => {
    if (!confirm(`Delete ${i.display_name}?`)) return;
    await (supabase as any).from("integrations").delete().eq("id", i.id);
    load();
  };

  const test = async (i: any) => {
    try {
      const { data, error } = await supabase.functions.invoke("integration-dispatch", {
        body: { event_type: "manual_test", message: `Test from HFAI — ${new Date().toLocaleString()}`, integration_id: i.id },
      });
      if (error) throw error;
      toast({ title: "Test sent", description: `Dispatched to ${data?.dispatched ?? 0} integration.` });
      load();
    } catch (e: any) {
      toast({ title: "Test failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <SubscriptionGate feature="Integrations">
      <div className="space-y-section">
        <SectionHeader
          title="Integrations"
          description="Push violation alerts and compliance evidence to Slack, Teams, your data warehouse, or any HTTPS endpoint."
        />

        {/* Run nightly export now (Snowflake/S3) */}
        {integrations.some((i) => ["snowflake", "s3"].includes(i.integration_type) && i.enabled) && (
          <div className="flex justify-end">
            <Button
              variant="outline" size="sm"
              onClick={async () => {
                toast({ title: "Export started", description: "Pushing last 24h to your warehouse / S3…" });
                const { data, error } = await supabase.functions.invoke("nightly-compliance-export", { body: {} });
                if (error) toast({ title: "Export failed", description: error.message, variant: "destructive" });
                else toast({ title: "Export complete", description: `${data?.exported ?? 0} destinations updated.` });
                load();
              }}
            >
              <Database className="h-3.5 w-3.5 mr-1.5" /> Run export now
            </Button>
          </div>
        )}

        {/* Catalog */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATALOG.map((c) => {
            const Icon = c.icon;
            const requiredLevel = TIER_LEVEL[c.minTier];
            const locked = currentLevel < requiredLevel;
            const installed = integrations.filter(i => i.integration_type === c.type);
            return (
              <ContentCard key={c.type} title={c.name}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground/70">{c.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{c.minTier}+</Badge>
                      {installed.length > 0 && (
                        <Badge variant="secondary" className="text-[10px]">{installed.length} active</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm" variant={locked ? "outline" : "default"}
                    onClick={() => !locked && openConfigure(c.type)}
                    disabled={locked}
                  >
                    {locked ? "Upgrade" : <><Plus className="h-3.5 w-3.5 mr-1" /> Add</>}
                  </Button>
                </div>

                {installed.map((i) => (
                  <div key={i.id} className="flex items-center gap-2 p-2 rounded border border-border bg-muted/30 mt-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{i.display_name}</p>
                      <p className="text-[11px] text-card-foreground/50 truncate">
                        {i.last_delivered_at
                          ? <>Last sent {formatDistanceToNow(new Date(i.last_delivered_at), { addSuffix: true })}</>
                          : "Never sent"}
                        {i.last_error && <span className="text-destructive ml-2">• {i.last_error.slice(0, 40)}</span>}
                      </p>
                    </div>
                    {i.last_error
                      ? <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                      : i.last_delivered_at && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                    <Switch checked={i.enabled} onCheckedChange={() => toggle(i)} />
                    <Button size="sm" variant="ghost" onClick={() => test(i)} title="Send test"><Send className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => openConfigure(c.type, i)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </ContentCard>
            );
          })}
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading integrations…</p>}

        {/* Configure dialog */}
        <Dialog open={!!open} onOpenChange={(v) => !v && (setOpen(null), setEditing(null))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit" : "Add"} {open && CATALOG.find(c => c.type === open)?.name}
              </DialogTitle>
              <DialogDescription>
                {open && CATALOG.find(c => c.type === open)?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Display name</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. #compliance-alerts" />
              </div>
              {open && CATALOG.find(c => c.type === open)?.fields.map((f) => (
                <div key={f.key}>
                  <Label>{f.label} {f.required && <span className="text-destructive">*</span>}</Label>
                  <Input
                    type={f.type ?? "text"}
                    value={formConfig[f.key] ?? ""}
                    onChange={(e) => setFormConfig({ ...formConfig, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              <div>
                <Label>Trigger when…</Label>
                <Select value={formTrigger} onValueChange={setFormTrigger}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SubscriptionGate>
  );
}
