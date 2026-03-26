/**
 * Generates lightweight index.html shells for each route in the sitemap.
 * Each shell has proper meta tags and loads the SPA bundle,
 * so crawlers get a 200 response instead of a 404 redirect.
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";

const DIST = resolve(process.cwd(), "dist");
const SITEMAP = resolve(DIST, "sitemap.xml");

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
  "/governance": {
    title: "AI Governance Framework — HFAI",
    description: "A structured approach to AI governance: model inventory, evaluation, data usage, and oversight.",
  },
  "/nist-compliance": {
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
};

// Read the root index.html as template
const rootHtml = readFileSync(resolve(DIST, "index.html"), "utf-8");

let generated = 0;

for (const [route, meta] of Object.entries(routeMeta)) {
  if (route === "/" || !meta) continue;

  const dir = resolve(DIST, route.slice(1)); // remove leading /
  const filePath = resolve(dir, "index.html");

  // Don't overwrite if already exists
  if (existsSync(filePath)) continue;

  // Create the shell by replacing meta tags in the root template
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
      /<link rel="canonical" href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="https://www.hfa-i.org${route}" />`
    );

  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, html, "utf-8");
  generated++;
}

console.log(`✅ Generated ${generated} static HTML shells for SEO.`);
