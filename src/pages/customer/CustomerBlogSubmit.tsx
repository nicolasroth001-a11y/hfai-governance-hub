import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CustomerBlogSubmit() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", tags: "", source_url: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: t("customerBlogSubmit.titleRequired"), variant: "destructive" });
      return;
    }
    setSaving(true);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const words = form.content.trim().split(/\s+/).length;
    const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

    const { error } = await supabase.from("blog_posts").insert({
      title: form.title.trim(), slug: slugify(form.title) + "-" + Date.now(), excerpt: form.excerpt.trim(),
      content: form.content, tags, status: "pending_review", author_name: profile?.name || "Guest",
      source_url: form.source_url.trim(), submitter_email: profile?.email || "", read_time: readTime,
      meta_title: form.title.trim(), meta_description: form.excerpt.trim(),
    } as any);

    setSaving(false);
    if (error) {
      toast({ title: t("customerBlogSubmit.submitError"), description: error.message, variant: "destructive" });
    } else {
      try {
        await supabase.functions.invoke("notify-blog-submission", {
          body: { title: form.title.trim(), author_name: profile?.name || "Guest", submitter_email: profile?.email || "" },
        });
      } catch (e) { console.warn("Notification failed (non-blocking):", e); }
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <SectionHeader title={t("customerBlogSubmit.title")} description={t("customerBlogSubmit.description")} />
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">{t("customerBlogSubmit.submissionReceived")}</h2>
            <p className="text-sm text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: t("customerBlogSubmit.submissionReceivedDesc", { email: profile?.email }) }} />
            <Button onClick={() => { setSubmitted(false); setForm({ title: "", excerpt: "", content: "", tags: "", source_url: "" }); }}>
              {t("customerBlogSubmit.submitAnother")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title={t("customerBlogSubmit.title")} description={t("customerBlogSubmit.description")} />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title">{t("customerBlogSubmit.articleTitle")} *</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="How We Implemented AI Governance at Scale" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="excerpt">{t("customerBlogSubmit.briefSummary")}</Label>
              <Textarea id="excerpt" value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={2} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="content">{t("customerBlogSubmit.articleContent")}</Label>
              <Textarea id="content" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={16} className="mt-1 font-mono text-sm" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tags">{t("customerBlogSubmit.tags")}</Label>
                <Input id="tags" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="AI Governance, EU AI Act" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="source_url">{t("customerBlogSubmit.sourceUrl")}</Label>
                <Input id="source_url" value={form.source_url} onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))} placeholder="https://example.com/research" className="mt-1" />
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={saving}>
              <Send className="h-4 w-4" />
              {saving ? t("customerBlogSubmit.submitting") : t("customerBlogSubmit.submitForReview")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
