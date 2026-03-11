import { useState, useEffect, useCallback } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Mail, Plus, Trash2, Send, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationPrefs {
  id?: string;
  email_enabled: boolean;
  email_recipients: string[];
  notify_all_violations: boolean;
  notify_high_severity: boolean;
  notify_patterns: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  email_enabled: true,
  email_recipients: [],
  notify_all_violations: true,
  notify_high_severity: true,
  notify_patterns: true,
};

interface NotificationLog {
  id: string;
  channel: string;
  subject: string | null;
  status: string;
  recipients: string[];
  created_at: string;
}

export default function CustomerNotifications() {
  const { profile } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);

  const loadData = useCallback(async () => {
    if (!profile?.org_id) return;
    setLoading(true);
    try {
      const [prefsRes, logsRes] = await Promise.all([
        supabase.from("notification_preferences").select("*").eq("org_id", profile.org_id).maybeSingle(),
        supabase.from("notification_logs").select("*").eq("org_id", profile.org_id).order("created_at", { ascending: false }).limit(20),
      ]);
      if (prefsRes.data) {
        setPrefs({
          id: prefsRes.data.id,
          email_enabled: prefsRes.data.email_enabled,
          email_recipients: prefsRes.data.email_recipients || [],
          notify_all_violations: prefsRes.data.notify_all_violations,
          notify_high_severity: prefsRes.data.notify_high_severity,
          notify_patterns: prefsRes.data.notify_patterns,
        });
      }
      setLogs((logsRes.data as NotificationLog[]) || []);
    } catch (err) {
      console.error("Load notifications error:", err);
    }
    setLoading(false);
  }, [profile?.org_id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!profile?.org_id) return;
    setSaving(true);
    try {
      const payload = {
        org_id: profile.org_id,
        email_enabled: prefs.email_enabled,
        email_recipients: prefs.email_recipients,
        notify_all_violations: prefs.notify_all_violations,
        notify_high_severity: prefs.notify_high_severity,
        notify_patterns: prefs.notify_patterns,
        updated_at: new Date().toISOString(),
      };

      if (prefs.id) {
        const { error } = await supabase.from("notification_preferences").update(payload).eq("id", prefs.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("notification_preferences").insert(payload).select().single();
        if (error) throw error;
        setPrefs(p => ({ ...p, id: data.id }));
      }
      toast({ title: "Saved", description: "Notification preferences updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const addRecipient = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", variant: "destructive" });
      return;
    }
    if (prefs.email_recipients.includes(email)) {
      toast({ title: "Already added", variant: "destructive" });
      return;
    }
    setPrefs(p => ({ ...p, email_recipients: [...p.email_recipients, email] }));
    setNewEmail("");
  };

  const removeRecipient = (email: string) => {
    setPrefs(p => ({ ...p, email_recipients: p.email_recipients.filter(e => e !== email) }));
  };

  const sendTestNotification = async () => {
    if (!profile?.org_id) return;
    setSendingTest(true);
    try {
      // First save prefs
      await handleSave();
      const { data, error } = await supabase.functions.invoke("notify-violation", {
        body: {
          violation_id: "test",
          trigger_type: "new_violation",
        },
      });
      if (error) throw error;
      if (data?.skipped) {
        toast({ title: "Skipped", description: data.reason });
      } else if (data?.success) {
        toast({ title: "Test sent!", description: `Email sent to ${data.recipients} recipient(s).` });
        loadData();
      } else {
        toast({ title: "Failed", description: "Could not send test email.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSendingTest(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Notifications" description="Configure email alerts for violations" />
        <div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Notifications" subtitle="Configure email alerts for violations and patterns" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Settings */}
        <ContentCard title="Email Notifications" className="md:col-span-2">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <Label className="text-base font-semibold">Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive violation alerts via email</p>
                </div>
              </div>
              <Switch
                checked={prefs.email_enabled}
                onCheckedChange={(v) => setPrefs(p => ({ ...p, email_enabled: v }))}
              />
            </div>

            {prefs.email_enabled && (
              <>
                <div className="border-t border-border pt-4 space-y-4">
                  <Label className="text-sm font-medium">Recipients</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="team@company.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={addRecipient} variant="outline">
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prefs.email_recipients.map((email) => (
                      <Badge key={email} variant="secondary" className="gap-1 pr-1">
                        {email}
                        <button onClick={() => removeRecipient(email)} className="ml-1 hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {prefs.email_recipients.length === 0 && (
                      <p className="text-sm text-muted-foreground">No recipients added. Your org contact email will be used as fallback.</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <Label className="text-sm font-medium">Trigger Events</Label>
                  {[
                    { key: "notify_all_violations" as const, label: "All new violations", desc: "Get notified whenever a new violation is detected" },
                    { key: "notify_high_severity" as const, label: "High/Critical severity", desc: "Alert on high or critical severity violations" },
                    { key: "notify_patterns" as const, label: "Pattern detection", desc: "Alert when recurring violation patterns are identified" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={prefs[key]}
                        onCheckedChange={(v) => setPrefs(p => ({ ...p, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save Preferences"}
              </Button>
              <Button variant="outline" onClick={sendTestNotification} disabled={sendingTest || !prefs.email_enabled}>
                <Send className="h-4 w-4 mr-2" />
                {sendingTest ? "Sending…" : "Send Test"}
              </Button>
            </div>
          </div>
        </ContentCard>

        {/* Notification History */}
        <ContentCard title="Recent Notifications" className="md:col-span-2">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {log.status === "sent" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{log.subject || "Notification"}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.recipients?.join(", ")} · {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={log.status === "sent" ? "default" : "destructive"} className="shrink-0">
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ContentCard>
      </div>
    </div>
  );
}
