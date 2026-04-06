/**
 * Generates lightweight index.html shells for each route in the sitemap.
 * Each shell has proper meta tags and loads the SPA bundle,
 * so crawlers get a 200 response instead of a 404 redirect.
 * 
 * Also fetches published blog posts from the database to generate
 * proper OG-tagged shells for LinkedIn/social sharing.
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";

const DIST = resolve(process.cwd(), "dist");

// Supabase config for fetching blog posts
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://uomnlgpqundhlmqkuhog.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbW5sZ3BxdW5kaGxtcWt1aG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODk1NjQsImV4cCI6MjA4Nzk2NTU2NH0.zCV0U5BmAZPUZQWidM8-HopJgxdxk7CI6rd2AAuW8ko";

// Route-specific meta (title + description)
const routeMeta = {
  "/": null, // already has index.html
  "/pricing/contact": {
    title: "Pricing — HFAI AI Governance Platform",
    description: "See HFAI pricing plans. Start free, upgrade as your AI governance needs grow.",
  },
  "/pilot": {
    title: "Start Free Pilot — HFAI",
    description: "Start your free 14-day AI governance pilot. No credit card required.",
  },
  "/docs/sdk": {
    title: "SDK Documentation — HFAI",
    description: "Integrate HFAI into your AI systems with our SDK. Quick start guides and API reference.",
  },
  "/blog": {
    title: "AI Governance Blog — HFAI",
    description: "Practical guides on AI compliance, governance platforms, and keeping humans in control.",
  },
  "/blog/submit": {
    title: "Submit a Blog Post — HFAI",
    description: "Share your AI governance insights with the HFAI community. Submit an article for review.",
  },
  "/blog/ai-governance-platform-guide": {
    title: "AI Governance Platform: Complete Guide 2026 — HFAI",
    description: "Everything you need to know about AI governance platforms, compliance, and human oversight.",
  },
  "/blog/eu-ai-act-compliance-tool": {
    title: "EU AI Act Compliance Tool — HFAI",
    description: "How HFAI helps you comply with the EU AI Act. Risk tiers, governance features, and more.",
  },
  "/blog/human-oversight-ai-systems": {
    title: "Why Human Oversight Is Non-Negotiable for AI — HFAI",
    description: "Human oversight in AI systems: why it matters, how to implement it, and regulatory requirements.",
  },
  "/blog/eu-ai-act-omnibus-vii-timeline-update": {
    title: "EU AI Act Omnibus VII Timeline Update — HFAI",
    description: "Latest updates on the EU AI Act Omnibus VII timeline and what it means for AI compliance.",
  },
  "/governance": {
    title: "AI Governance Framework — HFAI",
    description: "A structured approach to AI governance: model inventory, evaluation, data usage, and oversight.",
  },
  "/nist-ai-rmf": {
    title: "NIST AI RMF Compliance — HFAI",
    description: "Map your AI risk management to the NIST AI RMF framework with HFAI.",
  },
  "/login/customer": {
    title: "Sign In — HFAI",
    description: "Sign in to your HFAI account to manage AI governance and compliance.",
  },
  "/signup/customer": {
    title: "Create Account — HFAI",
    description: "Create your free HFAI account and start governing your AI systems today.",
  },
  "/unsubscribe": {
    title: "Unsubscribe — HFAI",
    description: "Manage your HFAI email preferences.",
  },
};

function generateShell(rootHtml, route, meta) {
  let html = rootHtml
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${meta.title}</title>`
    )
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${meta.description}" />`
    )
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${meta.title}" />`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${meta.description}" />`
    )
    .replace(
      /<meta property="og:url" content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="https://hfa-i.org${route}" />`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
      `<meta name="twitter:title" content="${meta.title}" />`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
      `<meta name="twitter:description" content="${meta.description}" />`
    )
    .replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="https://hfa-i.org${route}" />`
    );

  // Add og:type article for blog posts
  if (route.startsWith("/blog/")) {
    html = html.replace(
      /<meta property="og:type" content="[^"]*"\s*\/?>/,
      `<meta property="og:type" content="article" />`
    );
  }

  return html;
}

async function fetchBlogPosts() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?status=eq.published&select=slug,title,excerpt,meta_title,meta_description`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) {
      console.warn(`⚠️  Could not fetch blog posts (${res.status}). Skipping dynamic blog shells.`);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.warn("⚠️  Failed to fetch blog posts:", err.message);
    return [];
  }
}

async function main() {
  const rootHtml = readFileSync(resolve(DIST, "index.html"), "utf-8");
  let generated = 0;

  // Generate static route shells
  for (const [route, meta] of Object.entries(routeMeta)) {
    if (route === "/" || !meta) continue;

    const dir = resolve(DIST, route.slice(1));
    const filePath = resolve(dir, "index.html");
    if (existsSync(filePath)) continue;

    const html = generateShell(rootHtml, route, meta);
    mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, html, "utf-8");
    generated++;
  }

  // Fetch and generate blog post shells
  const blogPosts = await fetchBlogPosts();
  for (const post of blogPosts) {
    const route = `/blog/${post.slug}`;
    
    // Skip if already handled by static routes
    if (routeMeta[route]) continue;

    const title = (post.meta_title || post.title) + " | HFAI";
    const description = post.meta_description || post.excerpt || "";

    const dir = resolve(DIST, `blog/${post.slug}`);
    const filePath = resolve(dir, "index.html");
    if (existsSync(filePath)) continue;

    const html = generateShell(rootHtml, route, { title, description });
    mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, html, "utf-8");
    generated++;
    console.log(`  📝 ${post.slug}`);
  }

  console.log(`✅ Generated ${generated} static HTML shells for SEO (${blogPosts.length} blog posts from database).`);
}

main();
