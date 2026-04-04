import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Send, Users, Eye, Loader2, Mail, FileText } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function AdminNewsletter() {
  const { t } = useTranslation();
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stats, setStats] = useState({ active: 0, total: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-blast", { body: { action: "get_stats" } });
      if (error) throw error;
      setStats(data);
    } catch { console.error("Failed to load subscriber stats"); } finally { setLoadingStats(false); }
  };

  const handleSend = async () => {
    setShowConfirm(false);
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-blast", {
        body: { action: "send_blast", subject, preheader, content: formatContent(content) },
      });
      if (error) throw error;
      toast({ title: t("adminNewsletter.sent"), description: t("adminNewsletter.sentDesc", { queued: data.queued, total: data.total }) });
      setSubject(""); setPreheader(""); setContent("");
    } catch (err: any) {
      toast({ title: t("adminNewsletter.sendFailed"), description: err.message || "Something went wrong.", variant: "destructive" });
    } finally { setSending(false); }
  };

  const formatContent = (text: string) => {
    return text.split("\n\n").filter(Boolean)
      .map((para) => `<p style="font-size:15px;color:#55575d;line-height:1.7;margin:0 0 14px">${para.replace(/\n/g, "<br/>")}</p>`)
      .join("");
  };

  const canSend = subject.trim() && content.trim() && stats.active > 0;

  return (
    <div>
      <SectionHeader title={t("adminNewsletter.title")} description={t("adminNewsletter.description")} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title={t("adminNewsletter.activeSubscribers")} value={loadingStats ? "..." : stats.active.toString()} icon={Users} />
        <StatCard title={t("adminNewsletter.totalSubscribers")} value={loadingStats ? "..." : stats.total.toString()} icon={Mail} />
        <StatCard title={t("adminNewsletter.templates")} value="3" icon={FileText} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            {t("adminNewsletter.composeNewsletter")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("adminNewsletter.subjectLine")}</label>
            <Input placeholder={t("adminNewsletter.subjectPlaceholder")} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t("adminNewsletter.preheader")} <span className="text-muted-foreground font-normal">{t("adminNewsletter.preheaderHint")}</span>
            </label>
            <Input placeholder={t("adminNewsletter.preheaderPlaceholder")} value={preheader} onChange={(e) => setPreheader(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t("adminNewsletter.content")} <span className="text-muted-foreground font-normal">{t("adminNewsletter.contentHint")}</span>
            </label>
            <Textarea placeholder={`Hi there,\n\nHere's what's been happening in AI governance this month...\n\nBest,\nNicolas`} value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="font-mono text-sm" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowPreview(true)} disabled={!subject.trim() && !content.trim()}>
              <Eye className="h-4 w-4 mr-2" /> {t("adminNewsletter.preview")}
            </Button>
            <Button onClick={() => setShowConfirm(true)} disabled={!canSend || sending}>
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {t("adminNewsletter.sendTo", { count: stats.active })}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("adminNewsletter.emailPreview")}</DialogTitle>
            <DialogDescription>{t("adminNewsletter.emailPreviewDesc")}</DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-[#1a1a19] px-6 py-4">
              <span className="text-[#c9a96e] font-bold text-lg tracking-wide">⛨ HFAI</span>
            </div>
            <div className="p-6 bg-white">
              {subject && <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">{subject}</h2>}
              <div className="text-[15px] text-[#55575d] leading-relaxed space-y-3">
                {content.split("\n\n").filter(Boolean).map((para, i) => (
                  <p key={i} className="whitespace-pre-line">{para}</p>
                ))}
              </div>
              <hr className="my-6 border-[#e5e5e5]" />
              <p className="text-xs text-[#999]">{t("adminNewsletter.receivingNote")}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminNewsletter.sendNewsletter")}</DialogTitle>
            <DialogDescription>{t("adminNewsletter.sendConfirmDesc", { subject, count: stats.active })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>{t("adminNewsletter.cancel")}</Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {t("adminNewsletter.sendNow")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
