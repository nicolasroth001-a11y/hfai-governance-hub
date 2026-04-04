import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostForm {
  title: string; slug: string; excerpt: string; content: string; tags: string;
  status: string; featured: boolean; meta_title: string; meta_description: string;
  read_time: string; author_name: string; source_url: string;
}

const defaultForm: PostForm = {
  title: "", slug: "", excerpt: "", content: "", tags: "", status: "draft",
  featured: false, meta_title: "", meta_description: "", read_time: "",
  author_name: "HFAI Team", source_url: "",
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminBlogEditor() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<PostForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew && id) {
      supabase.from("blog_posts").select("*").eq("id", id).single()
        .then(({ data, error }) => {
          if (error || !data) { toast({ title: t("adminBlogEditor.notFound"), variant: "destructive" }); navigate("/admin/blog"); return; }
          setForm({
            title: data.title, slug: data.slug, excerpt: data.excerpt || "",
            content: data.content || "", tags: (data.tags || []).join(", "),
            status: data.status, featured: data.featured,
            meta_title: data.meta_title || "", meta_description: data.meta_description || "",
            read_time: data.read_time || "", author_name: data.author_name || "HFAI Team",
            source_url: (data as any).source_url || "",
          });
          setLoading(false);
        });
    }
  }, [id]);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({ ...prev, title, slug: isNew ? slugify(title) : prev.slug, meta_title: prev.meta_title || title }));
  };

  const estimateReadTime = (content: string): string => {
    const words = content.trim().split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
  };

  const handleSave = async (publishNow = false) => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: t("adminBlogEditor.titleSlugRequired"), variant: "destructive" }); return;
    }
    setSaving(true);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const readTime = form.read_time || estimateReadTime(form.content);
    const status = publishNow ? "published" : form.status;
    const published_at = publishNow ? new Date().toISOString() : undefined;

    const payload: Record<string, any> = {
      title: form.title.trim(), slug: form.slug.trim(), excerpt: form.excerpt.trim(),
      content: form.content, tags, status, featured: form.featured,
      meta_title: form.meta_title.trim() || form.title.trim(),
      meta_description: form.meta_description.trim() || form.excerpt.trim(),
      read_time: readTime, author_name: form.author_name.trim(),
      source_url: form.source_url.trim(), updated_at: new Date().toISOString(),
      ...(published_at ? { published_at } : {}),
    };

    let error;
    if (isNew) { ({ error } = await supabase.from("blog_posts").insert(payload as any)); }
    else { ({ error } = await supabase.from("blog_posts").update(payload as any).eq("id", id)); }

    setSaving(false);
    if (error) {
      toast({ title: t("adminBlogEditor.errorSaving"), description: error.message, variant: "destructive" });
    } else {
      toast({
        title: publishNow ? t("adminBlogEditor.publishedMsg") : t("adminBlogEditor.saved"),
        description: publishNow ? t("adminBlogEditor.publishedMsgDesc", { title: form.title }) : t("adminBlogEditor.savedDesc", { title: form.title, status }),
      });
      navigate("/admin/blog");
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground p-8">{t("adminBlogEditor.loading")}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/blog")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <SectionHeader title={isNew ? t("adminBlogEditor.newPost") : t("adminBlogEditor.editPost")} description={t("adminBlogEditor.description")} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => handleSave(false)} disabled={saving}>
            <Save className="h-3.5 w-3.5" /> {t("adminBlogEditor.saveDraft")}
          </Button>
          <Button size="sm" className="gap-1" onClick={() => handleSave(true)} disabled={saving}>
            <Send className="h-3.5 w-3.5" /> {t("adminBlogEditor.publish")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">{t("adminBlogEditor.contentTab")}</TabsTrigger>
          <TabsTrigger value="seo">{t("adminBlogEditor.seoTab")}</TabsTrigger>
          <TabsTrigger value="preview">{t("adminBlogEditor.previewTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">{t("adminBlogEditor.title")}</Label>
              <Input id="title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder={t("adminBlogEditor.titlePlaceholder")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="slug">{t("adminBlogEditor.slug")}</Label>
              <Input id="slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder={t("adminBlogEditor.slugPlaceholder")} className="mt-1 font-mono text-xs" />
            </div>
            <div>
              <Label htmlFor="excerpt">{t("adminBlogEditor.excerpt")}</Label>
              <Textarea id="excerpt" value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} placeholder={t("adminBlogEditor.excerptPlaceholder")} rows={2} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="content">{t("adminBlogEditor.contentLabel")}</Label>
              <Textarea id="content" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder={"# Your Article\n\nWrite your content here using **Markdown** formatting."} rows={20} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label htmlFor="tags">{t("adminBlogEditor.tags")}</Label>
              <Input id="tags" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder={t("adminBlogEditor.tagsPlaceholder")} className="mt-1" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">{t("adminBlogEditor.seoSettings")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">{t("adminBlogEditor.metaTitle")}</Label>
                <Input id="meta_title" value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} placeholder={t("adminBlogEditor.metaTitlePlaceholder")} className="mt-1" />
                <p className="text-[10px] text-muted-foreground mt-1">{form.meta_title.length}/60 {t("adminBlogEditor.characters")}</p>
              </div>
              <div>
                <Label htmlFor="meta_desc">{t("adminBlogEditor.metaDescription")}</Label>
                <Textarea id="meta_desc" value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} placeholder={t("adminBlogEditor.metaDescPlaceholder")} rows={2} className="mt-1" />
                <p className="text-[10px] text-muted-foreground mt-1">{form.meta_description.length}/160 {t("adminBlogEditor.characters")}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">{t("adminBlogEditor.postSettings")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("adminBlogEditor.status")}</Label>
                  <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t("adminBlogEditor.draft")}</SelectItem>
                      <SelectItem value="published">{t("adminBlogEditor.publishedStatus")}</SelectItem>
                      <SelectItem value="archived">{t("adminBlogEditor.archived")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="author">{t("adminBlogEditor.author")}</Label>
                  <Input id="author" value={form.author_name} onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="source_url">{t("adminBlogEditor.sourceUrl")}</Label>
                <Input id="source_url" value={form.source_url} onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))} placeholder={t("adminBlogEditor.sourceUrlPlaceholder")} className="mt-1" />
                <p className="text-[10px] text-muted-foreground mt-1">{t("adminBlogEditor.sourceUrlHint")}</p>
              </div>
              <div>
                <Label htmlFor="read_time">{t("adminBlogEditor.readTime")}</Label>
                <Input id="read_time" value={form.read_time} onChange={(e) => setForm((f) => ({ ...f, read_time: e.target.value }))} placeholder={t("adminBlogEditor.readTimePlaceholder")} className="mt-1" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
                <Label>{t("adminBlogEditor.featuredPost")}</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardContent className="p-6 sm:p-8 prose prose-sm dark:prose-invert max-w-none">
              <h1>{form.title || t("adminBlogEditor.untitled")}</h1>
              <p className="text-muted-foreground text-sm">{form.excerpt}</p>
              <hr />
              <div className="whitespace-pre-wrap">{form.content || t("adminBlogEditor.noContent")}</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
