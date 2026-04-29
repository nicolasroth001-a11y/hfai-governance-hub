import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Download, Copy, Plus, Trash2, RefreshCw, Loader2, Link as LinkIcon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  body: string;
  is_default: boolean;
}

interface SessionState {
  id: string;
  extension_token: string;
  daily_cap: number;
  sent_today: number;
  min_delay_seconds: number;
  max_delay_seconds: number;
  active: boolean;
}

interface LinkedInLead {
  id: string;
  company_name: string;
  contact_name: string;
  contact_title: string;
  linkedin_url: string;
  linkedin_status: string;
  linkedin_message: string;
  linkedin_sent_at: string | null;
}

const STATUS_VARIANTS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  sent: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  accepted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  replied: "bg-emerald-600/20 text-emerald-400 border-emerald-600/40",
  skipped: "bg-muted text-muted-foreground",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function LinkedInOutreachSection() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [session, setSession] = useState<SessionState | null>(null);
  const [leads, setLeads] = useState<LinkedInLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTplName, setNewTplName] = useState("");
  const [newTplBody, setNewTplBody] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [editingTpl, setEditingTpl] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const [tplRes, sessRes, leadsRes] = await Promise.all([
        supabase.from("linkedin_templates").select("*").order("updated_at", { ascending: false }),
        supabase.from("linkedin_session_state").select("*").eq("admin_id", user.id).maybeSingle(),
        supabase
          .from("leads")
          .select("id,company_name,contact_name,contact_title,linkedin_url,linkedin_status,linkedin_message,linkedin_sent_at")
          .neq("linkedin_url", "")
          .not("linkedin_url", "is", null)
          .order("linkedin_sent_at", { ascending: false, nullsFirst: false })
          .limit(50),
      ]);

      setTemplates(tplRes.data || []);
      setLeads((leadsRes.data || []) as LinkedInLead[]);

      if (!sessRes.data) {
        // Auto-create session for this admin
        const { data: created } = await supabase
          .from("linkedin_session_state")
          .insert({ admin_id: user.id })
          .select()
          .single();
        setSession(created as SessionState);
      } else {
        setSession(sessRes.data as SessionState);
      }
    } catch (e: any) {
      toast({ title: "Failed to load LinkedIn data", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveTemplate = async (tpl?: Template) => {
    try {
      if (tpl) {
        await supabase
          .from("linkedin_templates")
          .update({ name: tpl.name, body: tpl.body })
          .eq("id", tpl.id);
        toast({ title: "Template updated" });
      } else {
        if (!newTplName || !newTplBody) return toast({ title: "Name and body required", variant: "destructive" });
        await supabase.from("linkedin_templates").insert({ name: newTplName, body: newTplBody });
        setNewTplName("");
        setNewTplBody("");
        toast({ title: "Template created" });
      }
      setEditingTpl(null);
      await load();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    }
  };

  const setDefault = async (id: string) => {
    await supabase.from("linkedin_templates").update({ is_default: false }).neq("id", id);
    await supabase.from("linkedin_templates").update({ is_default: true }).eq("id", id);
    toast({ title: "Default template set" });
    await load();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete template?")) return;
    await supabase.from("linkedin_templates").delete().eq("id", id);
    await load();
  };

  const updateSession = async (patch: Partial<SessionState>) => {
    if (!session) return;
    const { data } = await supabase.from("linkedin_session_state").update(patch).eq("id", session.id).select().single();
    if (data) setSession(data as SessionState);
  };

  const rotateToken = async () => {
    if (!session) return;
    if (!confirm("Rotate token? The old one will stop working immediately.")) return;
    const newToken = "hflin_" + Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    await updateSession({ extension_token: newToken });
    toast({ title: "Token rotated" });
  };

  const copyToken = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.extension_token);
    toast({ title: "Token copied" });
  };

  const downloadExtension = () => {
    fetch("/hfai-linkedin-extension.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "hfai-linkedin-extension.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => toast({ title: "Download failed", description: err.message, variant: "destructive" }));
  };

  const importBulkUrls = async () => {
    const lines = bulkUrls.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    let updated = 0;
    let added = 0;
    for (const line of lines) {
      // Format: linkedin_url | first last | title | company  (last 3 optional)
      const parts = line.split("|").map((s) => s.trim());
      const url = parts[0];
      if (!/linkedin\.com\/in\//.test(url)) continue;

      // Try match existing lead by url
      const { data: existing } = await supabase
        .from("leads")
        .select("id")
        .eq("linkedin_url", url)
        .maybeSingle();

      if (existing) {
        updated++;
      } else {
        await supabase.from("leads").insert({
          company_name: parts[3] || "Unknown",
          contact_name: parts[1] || "",
          contact_title: parts[2] || "",
          linkedin_url: url,
          status: "new",
          linkedin_status: "pending",
          verification_status: "verified",
          rationale: "Imported from LinkedIn URL list",
        });
        added++;
      }
    }
    setBulkUrls("");
    toast({ title: `Imported`, description: `${added} added, ${updated} already existed` });
    await load();
  };

  const skipLead = async (id: string) => {
    await supabase.from("leads").update({ linkedin_status: "skipped" }).eq("id", id);
    await load();
  };

  const resetLead = async (id: string) => {
    await supabase.from("leads").update({ linkedin_status: "pending", linkedin_message: null, linkedin_sent_at: null }).eq("id", id);
    toast({ title: "Lead reset to pending" });
    await load();
  };

  const resetAll = async () => {
    if (!confirm("Reset ALL leads to pending? (Includes sent ones — only do this for testing.)")) return;
    await supabase.from("leads").update({ linkedin_status: "pending", linkedin_message: null, linkedin_sent_at: null }).neq("linkedin_url", "").not("linkedin_url", "is", null);
    toast({ title: "All LinkedIn leads reset" });
    await load();
  };

  const resetCounter = async () => {
    await updateSession({ sent_today: 0 });
    toast({ title: "Daily counter reset to 0" });
  };

  return (
    <div className="space-y-6">
      <ContentCard title="🔗 Chrome extension setup">
        {loading || !session ? (
          <div className="h-24 rounded bg-muted/50 animate-pulse" />
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded border border-amber-500/30 bg-amber-500/5">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-foreground/80 leading-relaxed">
                <strong>Use responsibly.</strong> LinkedIn ToS technically prohibits automation. Stay under 20/day, keep messages personal, and stop immediately if LinkedIn warns you. The extension enforces 45-90s random delays and a daily cap to stay under detection thresholds.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button onClick={downloadExtension} className="gap-2">
                <Download className="h-4 w-4" /> Download extension (.zip)
              </Button>
              <Button variant="outline" onClick={copyToken} className="gap-2">
                <Copy className="h-4 w-4" /> Copy your token
              </Button>
              <Button variant="outline" onClick={rotateToken} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Rotate token
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Daily cap</Label>
                <Input
                  type="number"
                  min={1}
                  max={25}
                  value={session.daily_cap}
                  onChange={(e) => updateSession({ daily_cap: parseInt(e.target.value || "15") })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Min delay (s)</Label>
                <Input
                  type="number"
                  min={30}
                  value={session.min_delay_seconds}
                  onChange={(e) => updateSession({ min_delay_seconds: parseInt(e.target.value || "45") })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max delay (s)</Label>
                <Input
                  type="number"
                  min={45}
                  value={session.max_delay_seconds}
                  onChange={(e) => updateSession({ max_delay_seconds: parseInt(e.target.value || "90") })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sent today</Label>
                <div className="h-10 flex items-center px-3 rounded border border-border bg-muted/30 text-sm">
                  <span className="text-amber-500 font-semibold">{session.sent_today}</span>
                  <span className="text-muted-foreground">&nbsp;/ {session.daily_cap}</span>
                </div>
              </div>
            </div>

            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">Setup instructions</summary>
              <ol className="list-decimal ml-5 mt-2 space-y-1 leading-relaxed">
                <li>Download and unzip the extension</li>
                <li>Open <code className="bg-muted px-1 rounded">chrome://extensions</code></li>
                <li>Enable <strong>Developer mode</strong> (top-right toggle)</li>
                <li>Click <strong>Load unpacked</strong> → select the unzipped folder</li>
                <li>Click the HFAI icon in your toolbar, paste your token, click Save & verify</li>
                <li>Open LinkedIn, log in, then click <strong>Start auto-session</strong></li>
              </ol>
            </details>
          </div>
        )}
      </ContentCard>

      <ContentCard title="✉️ Connection request templates">
        <div className="text-xs text-muted-foreground mb-3">
          Variables: <code>{"{firstName}"}</code> <code>{"{fullName}"}</code> <code>{"{company}"}</code> <code>{"{title}"}</code> <code>{"{function}"}</code> <code>{"{industry}"}</code> · Max 290 chars · AI rewrites each one per prospect.
        </div>

        <div className="space-y-2 mb-4">
          {templates.map((t) => (
            <div key={t.id} className="border border-border rounded p-3">
              {editingTpl === t.id ? (
                <div className="space-y-2">
                  <Input value={t.name} onChange={(e) => setTemplates((prev) => prev.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x))} />
                  <Textarea value={t.body} onChange={(e) => setTemplates((prev) => prev.map((x) => x.id === t.id ? { ...x, body: e.target.value } : x))} rows={4} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveTemplate(t)}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingTpl(null); load(); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm">{t.name}</strong>
                      {t.is_default && <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">Default</Badge>}
                      <span className="text-xs text-muted-foreground">{t.body.length} chars</span>
                    </div>
                    <div className="flex gap-1">
                      {!t.is_default && <Button size="sm" variant="ghost" onClick={() => setDefault(t.id)}>Make default</Button>}
                      <Button size="sm" variant="ghost" onClick={() => setEditingTpl(t.id)}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteTemplate(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">{t.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border border-border rounded p-3 space-y-2 bg-muted/20">
          <Label className="text-xs">New template</Label>
          <Input placeholder="Template name" value={newTplName} onChange={(e) => setNewTplName(e.target.value)} />
          <Textarea placeholder="Hi {firstName}, ..." value={newTplBody} onChange={(e) => setNewTplBody(e.target.value)} rows={3} />
          <Button size="sm" onClick={() => saveTemplate()} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add</Button>
        </div>
      </ContentCard>

      <ContentCard title="📥 Import LinkedIn URLs">
        <div className="text-xs text-muted-foreground mb-2">
          Paste one per line. Format: <code>https://linkedin.com/in/handle | First Last | Title | Company</code> (last 3 optional)
        </div>
        <Textarea
          placeholder={"https://linkedin.com/in/janedoe | Jane Doe | Head of AI Governance | AstraZeneca\nhttps://linkedin.com/in/johnsmith"}
          value={bulkUrls}
          onChange={(e) => setBulkUrls(e.target.value)}
          rows={5}
          className="font-mono text-xs"
        />
        <Button onClick={importBulkUrls} className="mt-2 gap-1"><LinkIcon className="h-3.5 w-3.5" /> Import to pipeline</Button>
      </ContentCard>

      <ContentCard title={`💼 LinkedIn pipeline (${leads.length})`}>
        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 rounded bg-muted/50 animate-pulse" />)}</div>
        ) : leads.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No LinkedIn leads yet. Import URLs above.</p>
        ) : (
          <div className="space-y-1.5">
            {leads.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 border border-border rounded p-2.5 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{l.contact_name || "(no name)"}</span>
                    <span className="text-xs text-muted-foreground truncate">{l.contact_title} · {l.company_name}</span>
                    <Badge variant="outline" className={STATUS_VARIANTS[l.linkedin_status] || ""}>{l.linkedin_status}</Badge>
                  </div>
                  {l.linkedin_message && (
                    <p className="text-xs text-foreground/60 mt-1 line-clamp-1">{l.linkedin_message}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <a href={l.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline px-2">↗</a>
                  {l.linkedin_status === "pending" ? (
                    <Button size="sm" variant="ghost" onClick={() => skipLead(l.id)} className="h-7 text-xs">Skip</Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => resetLead(l.id)} className="h-7 text-xs">Reset</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
          <Button size="sm" variant="outline" onClick={resetCounter}>Reset daily counter</Button>
          <Button size="sm" variant="outline" onClick={resetAll}>Reset all leads to pending</Button>
        </div>
      </ContentCard>

      <ContentCard title="🧪 Testing & troubleshooting">
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <strong>Recommended first test (zero risk):</strong>
            </div>
            <ol className="list-decimal ml-5 space-y-1 text-xs text-foreground/80">
              <li>Import 1 LinkedIn URL above (use a 2nd-degree connection — someone you don't know yet)</li>
              <li>Download & install the extension (chrome://extensions → Developer mode → Load unpacked)</li>
              <li>Open the extension popup, paste your token, leave <strong>Dry Run ON</strong>, click <strong>Save & verify</strong> — should show ✓ Connected</li>
              <li>Open linkedin.com in another tab, log in</li>
              <li>Click <strong>Start session</strong> in the popup</li>
              <li>Watch the gold overlay appear on the LinkedIn profile — it should read headline, AI-personalize, open Connect modal, fill the message — then STOP. Nothing is sent.</li>
              <li>Close the modal manually, hit Reset on that lead, retry with Dry Run OFF when you're confident</li>
            </ol>
          </div>

          <details className="text-xs">
            <summary className="cursor-pointer hover:text-foreground py-1">❓ Nothing happens when I click Start</summary>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-muted-foreground">
              <li>Open Chrome DevTools (F12) on the LinkedIn tab → Console — look for <code>[HFAI]</code> logs</li>
              <li>At least one lead must have status <strong>pending</strong> + a valid <code>linkedin.com/in/...</code> URL</li>
              <li>A default template must exist (gold "Default" badge above)</li>
              <li>Daily counter must be below cap (Reset daily counter above)</li>
              <li>In the extension popup, click <strong>Save & verify</strong>. If it doesn't show "✓ Connected", your token is wrong — copy a fresh one</li>
            </ul>
          </details>

          <details className="text-xs">
            <summary className="cursor-pointer hover:text-foreground py-1">❓ Overlay appears but says "Connect button not found"</summary>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-muted-foreground">
              <li>You're already 1st-degree with this person — pick someone new</li>
              <li>LinkedIn changed their UI — let me know to update selectors</li>
              <li>You hit the LinkedIn weekly limit (~100 invites/week) — wait it out</li>
            </ul>
          </details>

          <details className="text-xs">
            <summary className="cursor-pointer hover:text-foreground py-1">❓ "Add note" button missing</summary>
            <p className="mt-2 text-muted-foreground">LinkedIn limits free accounts to ~5 personalized invites/month. Either upgrade to Premium or send without notes (extension will skip and mark these).</p>
          </details>
        </div>
      </ContentCard>
    </div>
  );
}
