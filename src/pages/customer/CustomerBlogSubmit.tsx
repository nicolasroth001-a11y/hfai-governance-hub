import { useState } from "react";
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
  const { profile } = useAuth();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    source_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
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
      author_name: profile?.name || "Guest",
      source_url: form.source_url.trim(),
      submitter_email: profile?.email || "",
      read_time: readTime,
      meta_title: form.title.trim(),
      meta_description: form.excerpt.trim(),
    } as any);

    setSaving(false);
    if (error) {
      toast({ title: "Error submitting", description: error.message, variant: "destructive" });
    } else {
      try {
        await supabase.functions.invoke("notify-blog-submission", {
          body: {
            title: form.title.trim(),
            author_name: profile?.name || "Guest",
            submitter_email: profile?.email || "",
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
      <div className="space-y-6">
        <SectionHeader title="Submit Blog Post" description="Share your expertise with the community" />
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Submission Received!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Our team will review your article and notify you at <strong>{profile?.email}</strong> once it's published.
            </p>
            <Button onClick={() => { setSubmitted(false); setForm({ title: "", excerpt: "", content: "", tags: "", source_url: "" }); }}>
              Submit Another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Submit Blog Post" description="Write an article for the HFAI blog. All submissions are reviewed before publishing." />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title">Article Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="How We Implemented AI Governance at Scale"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Brief Summary</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="A short description of what your article covers..."
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content">Article Content * (Markdown supported)</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder={"# Your Article\n\nWrite your content here using **Markdown** formatting.\n\n## Key Points\n\n- Point one\n- Point two"}
                rows={16}
                className="mt-1 font-mono text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="AI Governance, EU AI Act"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="source_url">Source / Reference URL</Label>
                <Input
                  id="source_url"
                  value={form.source_url}
                  onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))}
                  placeholder="https://example.com/research"
                  className="mt-1"
                />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={saving}>
              <Send className="h-4 w-4" />
              {saving ? "Submitting..." : "Submit for Review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
