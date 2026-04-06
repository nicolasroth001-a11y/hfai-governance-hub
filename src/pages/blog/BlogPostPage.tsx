import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, ArrowRight, Calendar, Clock, Tag, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageView } from "@/hooks/usePageView";

interface BlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  read_time: string;
  author_name: string;
  published_at: string | null;
  meta_title: string;
  meta_description: string;
  source_url: string | null;
}

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-foreground mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-foreground mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-foreground mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-primary/30 pl-4 italic text-muted-foreground my-4">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted-foreground">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-sm text-muted-foreground leading-relaxed mb-4">')
    .replace(/^/, '<p class="text-sm text-muted-foreground leading-relaxed mb-4">')
    .concat("</p>");
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  usePageView(`/blog/${slug}`);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("title, slug, content, excerpt, tags, read_time, author_name, published_at, meta_title, meta_description, source_url")
      .eq("slug", slug)
      .eq("status", "published")
      .single()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
        if (data) {
          const title = data.meta_title || data.title;
          const desc = data.meta_description || data.excerpt;
          document.title = title + " | HFAI";
          
          const setMeta = (prop: string, content: string, attr = "property") => {
            let el = document.querySelector(`meta[${attr}="${prop}"]`);
            if (!el) {
              el = document.createElement("meta");
              el.setAttribute(attr, prop);
              document.head.appendChild(el);
            }
            el.setAttribute("content", content);
          };
          const url = `https://hfa-i.org/blog/${data.slug}`;
          setMeta("og:title", title + " | HFAI");
          setMeta("og:description", desc);
          setMeta("og:url", url);
          setMeta("og:type", "article");
          setMeta("twitter:title", title + " | HFAI", "name");
          setMeta("twitter:description", desc, "name");
          setMeta("description", desc, "name");
          
          let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
          if (canonical) canonical.href = url;
        }
      });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground text-sm">{t("blogPost.loading")}</p></div>;
  if (!post) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">{t("blogPost.notFound")}</p>
      <Button asChild><Link to="/blog">{t("blogPost.backToBlog")}</Link></Button>
    </div>
  );

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
              <Link to="/blog">{t("blogPost.resources")}</Link>
            </Button>
            <Button size="sm" className="text-xs gap-1" asChild>
              <Link to="/pilot">{t("blogPost.freePilot")} <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      <article className="pt-28 pb-16 px-6 flex-1">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
          <Button variant="ghost" size="sm" className="gap-1 mb-6 -ml-2 text-xs" asChild>
            <Link to="/blog"><ArrowLeft className="h-3 w-3" /> {t("blogPost.allPosts")}</Link>
          </Button>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-primary font-semibold">
                <Tag className="h-2.5 w-2.5" /> {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground/60">
            {post.author_name && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author_name}</span>}
            {post.published_at && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.published_at).toLocaleDateString()}</span>}
            {post.read_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.read_time}</span>}
          </div>

          {post.excerpt && (
            <p className="mt-6 text-base text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-4">
              {post.excerpt}
            </p>
          )}

          <div
            className="mt-8 prose-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />

          {post.source_url && (
            <div className="mt-8 pt-6 border-t border-border/30">
              <a href={post.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-primary hover:underline">
                <ExternalLink className="h-3 w-3" /> {t("blogPost.viewSource")}
              </a>
            </div>
          )}
        </motion.div>
      </article>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-3xl text-center rounded-2xl border border-primary/20 bg-primary/5 p-10">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t("blogPost.ctaTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("blogPost.ctaDesc")}</p>
          <Button size="lg" className="mt-6 gap-2" asChild>
            <Link to="/pilot">{t("blogPost.ctaButton")} <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/30 py-8 px-6 text-center">
        <p className="text-[11px] text-muted-foreground/40">{t("blogPost.copyright", { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}
