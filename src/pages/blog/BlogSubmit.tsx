import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ArrowRight, ArrowLeft, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePageView } from "@/hooks/usePageView";
import { motion } from "framer-motion";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function BlogSubmit() {
  usePageView("/blog/submit");
  const { t } = useTranslation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author_name: "",
    submitter_email: "",
    excerpt: "",
    content: "",
    tags: "",
    source_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.submitter_email.trim() || !form.author_name.trim()) {
      toast({ title: t("blogSubmit.fillRequired"), variant: "destructive" });
      return;
    }

    setSaving(true);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const words = form.content.trim().split(/\s+/).length;
    const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

    const { error } = await supabase.from("blog_posts").insert({
      title: form.title.trim(),
      slug: slugify(form.title) + "-" + Date.now(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      tags,
      status: "pending_review",
      author_name: form.author_name.trim(),
      source_url: form.source_url.trim(),
      submitter_email: form.submitter_email.trim(),
      read_time: readTime,
      meta_title: form.title.trim(),
      meta_description: form.excerpt.trim(),
    } as any);

    setSaving(false);
    if (error) {
      toast({ title: t("blogSubmit.errorSubmitting"), description: error.message, variant: "destructive" });
    } else {
      try {
        await supabase.functions.invoke("notify-blog-submission", {
          body: {
            title: form.title.trim(),
            author_name: form.author_name.trim(),
            submitter_email: form.submitter_email.trim(),
          },
        });
      } catch (e) {
        console.warn("Notification failed (non-blocking):", e);
      }
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground tracking-tight">HFAI</span>
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-3">{t("blogSubmit.successTitle")}</h1>
            <p className="text-sm text-muted-foreground mb-6" dangerouslySetInnerHTML={{ __html: t("blogSubmit.successDesc", { email: form.submitter_email }) }} />
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link to="/blog">{t("blogSubmit.backToBlogBtn")}</Link>
              </Button>
              <Button asChild>
                <Link to="/pilot">{t("blogSubmit.startPilot")} <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground tracking-tight">HFAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link to="/blog">{t("blogSubmit.resources")}</Link>
            </Button>
            <Button size="sm" className="text-xs gap-1" asChild>
              <Link to="/pilot">{t("blogSubmit.freePilot")} <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6 flex-1">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
          <Button variant="ghost" size="sm" className="gap-1 mb-6 -ml-2 text-xs" asChild>
            <Link to="/blog"><ArrowLeft className="h-3 w-3" /> {t("blogSubmit.backToBlog")}</Link>
          </Button>

          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">{t("blogSubmit.submitPost")}</h1>
          <p className="text-sm text-muted-foreground mb-8">{t("blogSubmit.subtitle")}</p>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="author_name">{t("blogSubmit.yourName")} *</Label>
                    <Input id="author_name" value={form.author_name} onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))} placeholder="Jane Smith" className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="submitter_email">{t("blogSubmit.yourEmail")} *</Label>
                    <Input id="submitter_email" type="email" value={form.submitter_email} onChange={(e) => setForm((f) => ({ ...f, submitter_email: e.target.value }))} placeholder="jane@company.com" className="mt-1" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">{t("blogSubmit.articleTitle")} *</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="How We Implemented AI Governance at Scale" className="mt-1" required />
                </div>

                <div>
                  <Label htmlFor="excerpt">{t("blogSubmit.briefSummary")}</Label>
                  <Textarea id="excerpt" value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} placeholder="A short description of what your article covers..." rows={2} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="content">{t("blogSubmit.articleContent")}</Label>
                  <Textarea id="content" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder={"# Your Article\n\nWrite your content here using **Markdown** formatting.\n\n## Key Points\n\n- Point one\n- Point two"} rows={16} className="mt-1 font-mono text-sm" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tags">{t("blogSubmit.tags")}</Label>
                    <Input id="tags" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="AI Governance, EU AI Act" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="source_url">{t("blogSubmit.sourceUrl")}</Label>
                    <Input id="source_url" value={form.source_url} onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))} placeholder="https://example.com/research" className="mt-1" />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full gap-2" disabled={saving}>
                    <Send className="h-4 w-4" />
                    {saving ? t("blogSubmit.submitting") : t("blogSubmit.submitForReview")}
                  </Button>
                  <p className="text-[10px] text-muted-foreground/50 text-center mt-2">{t("blogSubmit.disclaimer")}</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <footer className="border-t border-border/30 py-8 px-6 text-center">
        <p className="text-[11px] text-muted-foreground/40">{t("blogSubmit.copyright", { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}
