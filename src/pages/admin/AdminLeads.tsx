import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, Mail, Send, Copy, Loader2, Trash2, RefreshCw, ShieldCheck, ShieldAlert, ShieldX, Linkedin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LinkedInOutreachSection from "@/components/admin/LinkedInOutreachSection";
import { toast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  company_name: string;
  website: string;
  industry: string;
  company_size: string;
  region: string;
  contact_name: string;
  contact_email: string;
  contact_title: string;
  ai_use_case: string;
  pain_points: string;
  rationale: string;
  email_subject: string;
  email_body: string;
  status: string;
  notes: string;
  sent_at: string | null;
  created_at: string;
  verification_status?: string;
  verification_notes?: string;
}

const STATUS_VARIANTS: Record<string, string> = {
  new: "bg-muted text-muted-foreground",
  drafted: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  sent: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  replied: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  qualified: "bg-emerald-600/20 text-emerald-400 border-emerald-600/40",
  dead: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [count, setCount] = useState(5);
  const [brief, setBrief] = useState("");
  const [hideUnverified, setHideUnverified] = useState(true);

  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (e) {
      toast({ title: "Failed to load leads", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-leads", {
        body: { industry, region, company_size: companySize, count, custom_brief: brief },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const verified = data?.verified ?? 0;
      const invalid = data?.invalid ?? 0;
      toast({
        title: `${data.leads?.length || 0} leads generated`,
        description: invalid > 0
          ? `${verified} verified · ${invalid} flagged unverified (website unreachable — likely fabricated)`
          : `All ${verified} leads passed website verification ✓`,
      });
      await fetchLeads();
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDraft = async (lead: Lead) => {
    setDraftingId(lead.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-cold-email", {
        body: { lead_id: lead.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Email drafted" });
      const updated = data.lead as Lead;
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setActiveLead(updated);
      setEditSubject(updated.email_subject);
      setEditBody(updated.email_body);
    } catch (e: any) {
      toast({ title: "Draft failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setDraftingId(null);
    }
  };

  const openLead = (lead: Lead) => {
    setActiveLead(lead);
    setEditSubject(lead.email_subject);
    setEditBody(lead.email_body);
  };

  const handleSend = async () => {
    if (!activeLead) return;
    if (!confirm(`Send this email to ${activeLead.contact_email} from nicolasroth@hfa-i.org?`)) return;
    setSendingId(activeLead.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-cold-email", {
        body: { lead_id: activeLead.id, subject_override: editSubject, body_override: editBody },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Email sent", description: `Delivered to ${activeLead.contact_email}` });
      const updated = data.lead as Lead;
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setActiveLead(null);
    } catch (e: any) {
      toast({ title: "Send failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  };

  const handleTestSend = async () => {
    if (!activeLead) return;
    setTestingId(activeLead.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-cold-email", {
        body: {
          lead_id: activeLead.id,
          subject_override: editSubject,
          body_override: editBody,
          recipient_override: "nicolasroth@hfa-i.org",
          is_test: true,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Test sent", description: "Check nicolasroth@hfa-i.org (subject prefixed [TEST]). Lead status unchanged." });
    } catch (e: any) {
      toast({ title: "Test send failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setTestingId(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch (e: any) {
      toast({ title: "Status update failed", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    try {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast({ title: "Lead deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${editSubject}\n\n${editBody}`);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Lead Generator"
        description="Generate prospect companies that need HFAI, draft personalized cold emails, and send from nicolasroth@hfa-i.org via Zoho."
      />

      <ContentCard title="Generate prospects">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Industry (optional)</Label>
            <Input placeholder="e.g. healthcare, fintech, HR tech" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Region (optional)</Label>
            <Input placeholder="e.g. EU, DACH, Nordics, US" value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Company size (optional)</Label>
            <Input placeholder="e.g. 200-1000, 1k-5k, enterprise" value={companySize} onChange={(e) => setCompanySize(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Count</Label>
            <Select value={String(count)} onValueChange={(v) => setCount(parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[3, 5, 7, 10].map((n) => <SelectItem key={n} value={String(n)}>{n} leads</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Custom brief (optional)</Label>
            <Textarea placeholder="e.g. companies that just announced AI initiatives, post-Series B, with active hiring for ML roles" value={brief} onChange={(e) => setBrief(e.target.value)} rows={2} />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating…" : "Generate leads"}
          </Button>
          <Button variant="outline" onClick={fetchLeads} disabled={loading} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </ContentCard>

      <ContentCard title={`Pipeline (${leads.filter(l => !hideUnverified || l.verification_status !== 'invalid').length}${hideUnverified && leads.some(l => l.verification_status === 'invalid') ? ` · ${leads.filter(l => l.verification_status === 'invalid').length} hidden` : ''})`}>
        <div className="mb-3 flex items-center gap-2">
          <Button size="sm" variant={hideUnverified ? "default" : "outline"} onClick={() => setHideUnverified(v => !v)} className="gap-1 h-7 text-xs">
            <ShieldCheck className="h-3 w-3" />
            {hideUnverified ? "Hiding unverified" : "Showing all"}
          </Button>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded bg-muted/50 animate-pulse" />)}
          </div>
        ) : leads.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No leads yet. Generate your first batch above.</p>
        ) : (
          <div className="space-y-2">
            {leads.filter(l => !hideUnverified || l.verification_status !== 'invalid').map((lead) => {
              const vStatus = lead.verification_status || 'unverified';
              const VIcon = vStatus === 'verified' ? ShieldCheck : vStatus === 'invalid' ? ShieldX : ShieldAlert;
              const vClass = vStatus === 'verified'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : vStatus === 'invalid'
                ? 'bg-destructive/10 text-destructive border-destructive/30'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/30';
              return (
              <div key={lead.id} className="border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[250px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{lead.company_name}</h3>
                      <Badge variant="outline" className={vClass} title={lead.verification_notes || vStatus}>
                        <VIcon className="h-3 w-3 mr-1" />{vStatus}
                      </Badge>
                      <Badge variant="outline" className={STATUS_VARIANTS[lead.status] || ""}>{lead.status}</Badge>
                      {lead.industry && <Badge variant="outline" className="text-xs">{lead.industry}</Badge>}
                      {lead.region && <Badge variant="outline" className="text-xs">{lead.region}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {lead.contact_name || "(no contact)"} {lead.contact_title && `· ${lead.contact_title}`}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{lead.contact_email || "—"}</p>
                    {lead.website && (
                      <a href={`https://${lead.website.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        {lead.website} ↗
                      </a>
                    )}
                    <p className="text-sm mt-2 text-foreground/80">{lead.rationale}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      <Select value={lead.status} onValueChange={(v) => handleStatusChange(lead.id, v)}>
                        <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["new", "drafted", "sent", "replied", "qualified", "dead"].map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(lead.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={draftingId === lead.id} onClick={() => handleDraft(lead)} className="gap-1">
                        {draftingId === lead.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        {lead.email_body ? "Re-draft" : "Draft email"}
                      </Button>
                      {lead.email_body && (
                        <Button size="sm" onClick={() => openLead(lead)} className="gap-1">
                          <Mail className="h-3.5 w-3.5" /> Review & send
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );})}
          </div>
        )}
      </ContentCard>

      <Dialog open={!!activeLead} onOpenChange={(o) => !o && setActiveLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send to {activeLead?.contact_name || activeLead?.company_name}</DialogTitle>
          </DialogHeader>
          {activeLead && (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground space-y-1 border border-border rounded p-3 bg-muted/30">
                <div><strong>From:</strong> Nicolas Roth &lt;nicolasroth@hfa-i.org&gt;</div>
                <div><strong>To:</strong> {activeLead.contact_email}</div>
                <div><strong>Company:</strong> {activeLead.company_name} · {activeLead.industry}</div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={14} className="font-mono text-sm" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" onClick={copyEmail} className="gap-1"><Copy className="h-4 w-4" /> Copy</Button>
            <Button variant="outline" onClick={handleTestSend} disabled={testingId === activeLead?.id} className="gap-1">
              {testingId === activeLead?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send test to me
            </Button>
            <Button variant="outline" onClick={() => setActiveLead(null)}>Cancel</Button>
            <Button onClick={handleSend} disabled={sendingId === activeLead?.id} className="gap-2">
              {sendingId === activeLead?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send from Zoho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
