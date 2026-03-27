import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get blog posts published in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: posts, error: postsError } = await supabase
      .from("blog_posts")
      .select("title, excerpt, slug, published_at")
      .eq("status", "published")
      .gte("published_at", thirtyDaysAgo.toISOString())
      .order("published_at", { ascending: false })
      .limit(10);

    if (postsError) throw postsError;

    if (!posts || posts.length === 0) {
      console.log("No new blog posts in the last 30 days — skipping digest");
      return new Response(JSON.stringify({ skipped: true, reason: "no_new_posts" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get month name
    const month = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Get all active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("status", "active");

    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      console.log("No active subscribers — skipping digest");
      return new Response(JSON.stringify({ skipped: true, reason: "no_subscribers" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const batchId = crypto.randomUUID();
    let queued = 0;

    for (const sub of subscribers) {
      try {
        const { error } = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "blog-digest",
            recipientEmail: sub.email,
            idempotencyKey: `digest-${month}-${sub.email}`,
            templateData: {
              month,
              posts: posts.map((p) => ({
                title: p.title,
                excerpt: p.excerpt,
                slug: p.slug,
              })),
            },
          },
        });
        if (!error) queued++;
      } catch (e) {
        console.error(`Failed to queue digest for ${sub.email}:`, e);
      }
    }

    console.log(`Blog digest sent: ${queued}/${subscribers.length}`, { batchId, month, postCount: posts.length });

    return new Response(
      JSON.stringify({ success: true, queued, total: subscribers.length, postCount: posts.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Blog digest error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
