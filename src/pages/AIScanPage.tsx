import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, Zap, Eye, Scale } from "lucide-react";
import { AIScannerWidget } from "@/components/scan/AIScannerWidget";
import { usePageView } from "@/hooks/usePageView";

export default function AIScanPage() {
  const [params] = useSearchParams();
  const initialUrl = params.get("url") || "";
  usePageView();

  useEffect(() => {
    document.title = "Free AI Compliance Scanner — Is your website breaking the EU AI Act? | HFAI";
    const meta =
      document.querySelector('meta[name="description"]') ||
      Object.assign(document.createElement("meta"), { name: "description" });
    meta.setAttribute(
      "content",
      "Paste any URL. We detect the AI on the page and tell you which EU AI Act articles you're breaking — in 10 seconds. Free, no signup."
    );
    document.head.appendChild(meta);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="px-6 py-4 border-b border-border/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">
            HF<span className="text-primary">AI</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs uppercase tracking-wider text-primary">
            <ShieldAlert className="h-3 w-3" /> Free AI Compliance Scanner
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Is your website <span className="text-destructive">breaking</span><br className="hidden sm:block" />{" "}
            the <span className="text-primary">EU AI Act</span>?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Paste any URL. We detect the AI running on the page and check it against the new transparency rules. Takes 10 seconds.
          </p>
        </motion.div>

        <div className="mt-10">
          <AIScannerWidget initialUrl={initialUrl} />
        </div>
      </section>

      {/* What it checks */}
      <section className="px-6 py-16 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">What we check</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: Eye,
                title: "AI fingerprints",
                body: "Chatbots, generative tools, recommendation engines, voice & video AI — we identify the providers in use (OpenAI, Anthropic, Intercom Fin, etc.).",
              },
              {
                icon: Scale,
                title: "EU AI Act exposure",
                body: "Article 5 (prohibited practices), Article 50 (transparency), Article 4 (AI literacy). We flag what you're missing and quote the article.",
              },
              {
                icon: Zap,
                title: "Fine estimate",
                body: "We project your worst-case fine exposure under the AI Act tiers (€7.5M / €15M / €35M) so you can decide if it's worth fixing.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-xl border border-border/40 bg-secondary/20 p-5 space-y-3"
              >
                <c.icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">{c.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 text-center text-xs text-muted-foreground">
        <p className="max-w-2xl mx-auto">
          This scan covers what's visible on the public homepage. A full audit (model APIs, internal tools, data
          flows, vendor risk) requires connecting your stack —{" "}
          <Link to="/pricing/contact" className="text-primary hover:underline">
            book a call
          </Link>{" "}
          if you want the deep version.
        </p>
      </section>
    </div>
  );
}
