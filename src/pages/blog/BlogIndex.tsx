import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePageView } from "@/hooks/usePageView";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  published_at: string | null;
  read_time: string;
  tags: string[];
  featured: boolean;
}

export default function BlogIndex() {
  usePageView("/blog");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("slug, title, excerpt, published_at, read_time, tags, featured")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

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
              <Link to="/blog">Resources</Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link to="/pricing/contact">Pricing</Link>
            </Button>
            <Button size="sm" className="text-xs gap-1" asChild>
              <Link to="/pilot">Free Pilot <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">Resources</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight max-w-3xl mx-auto">
            AI Governance Insights & Guides
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Practical guides on AI compliance, governance platforms, and keeping humans in control of AI decisions.
          </p>
        </motion.div>
      </section>

      <section className="px-6 pb-24 flex-1">
        <div className="mx-auto max-w-4xl grid gap-6">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-12">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No posts yet — check back soon!</p>
          ) : (
            posts.map((article, i) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Link to={`/blog/${article.slug}`}>
                  <Card className="border border-border/40 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/20 transition-all duration-300 group">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        {article.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-primary font-semibold">
                            <Tag className="h-2.5 w-2.5" /> {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {article.title}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {article.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground/60">
                        {article.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(article.published_at).toLocaleDateString()}
                          </span>
                        )}
                        {article.read_time && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.read_time}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl text-center rounded-2xl border border-primary/20 bg-primary/5 p-10">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Ready to govern your AI?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Start your free 14-day pilot — no credit card required.</p>
          <Button size="lg" className="mt-6 gap-2" asChild>
            <Link to="/pilot">Start Free Pilot <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/30 py-8 px-6 text-center">
        <p className="text-[11px] text-muted-foreground/40">© {new Date().getFullYear()} HFAI — All rights reserved</p>
      </footer>
    </div>
  );
}
