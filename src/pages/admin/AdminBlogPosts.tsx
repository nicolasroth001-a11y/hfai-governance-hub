import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  featured: boolean;
  tags: string[];
  created_at: string;
  published_at: string | null;
}

export default function AdminBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, status, featured, tags, created_at, published_at")
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Post deleted." });
      loadPosts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Blog Posts" subtitle="Create and manage your blog content" />
        <Button className="gap-2" onClick={() => navigate("/admin/blog/new")}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : posts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground text-sm">No blog posts yet.</p>
            <Button className="mt-4 gap-2" onClick={() => navigate("/admin/blog/new")}>
              <Plus className="h-4 w-4" /> Write Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="border-border/40">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-[10px]">
                      {post.status}
                    </Badge>
                    {post.featured && <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Featured</Badge>}
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-[10px] text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground truncate">{post.title}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{post.excerpt || "No excerpt"}</p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground/60">
                    <Calendar className="h-2.5 w-2.5" />
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {post.status === "published" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to={`/blog/${post.slug}`} target="_blank"><Eye className="h-3.5 w-3.5" /></Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/blog/${post.id}`)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(post.id, post.title)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
