import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Download, Check, ArrowRight, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePageView } from "@/hooks/usePageView";
import { toast } from "@/hooks/use-toast";

export default function GuardLandingPage() {
  usePageView("/guard");

  const handleDownload = () => {
    fetch("/hfai-guard.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "hfai-guard.zip";
        a.click();
        URL.revokeObjectURL(a.href);
        toast({ title: "Downloaded", description: "Unzip and load it in chrome://extensions" });
      })
      .catch((err) => toast({ title: "Download failed", description: err.message, variant: "destructive" }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-16 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Badge variant="outline" className="mb-6 border-primary/40 text-primary">
            <Shield className="h-3 w-3 mr-1.5" /> Free forever
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
            HFAI <span className="text-primary">Guard</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Real-time blocker for EU AI Act Article 5, COPPA, and unsafe AI prompts.
            Sits on top of ChatGPT, Claude, and Gemini.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={handleDownload} className="gap-2 text-base">
              <Download className="h-5 w-5" /> Download for Chrome
            </Button>
            <Link to="/customer/guard">
              <Button size="lg" variant="ghost" className="gap-2 text-base">
                See your dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Works in Chrome, Edge, Brave, Arc · No account required to install
          </p>
        </motion.div>
      </section>

      {/* What it blocks */}
      <section className="container mx-auto px-4 pb-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "EU AI Act Article 5", body: "Subliminal manipulation, social scoring, predictive policing, biometric categorisation, emotion recognition." },
            { title: "COPPA & Minors", body: "Requests for children's PII (address, phone, school) and grooming patterns." },
            { title: "Safety baseline", body: "Self-harm instructions, CSAM patterns, leaked SSNs and credit card numbers." },
          ].map((b) => (
            <Card key={b.title} className="rounded-[16px]">
              <CardContent className="p-5">
                <Check className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* The hook */}
      <section className="container mx-auto px-4 pb-24 max-w-4xl">
        <Card className="rounded-[20px] border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-wider text-primary">
              <Zap className="h-3 w-3" /> The catch (in a good way)
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
              Every block silently builds your audit trail.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
              The moment Guard blocks something, it logs the event to a free HFAI workspace
              created automatically for you. When an auditor, regulator, customer, or insurer asks
              "where's your human oversight, where's your Article 14 evidence?" — your dashboard
              already has 30 days of it. Upgrade to Starter to see the actual events, add reviewers,
              and export the full regulator-ready package.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" /> Install Guard (free)
              </Button>
              <Link to="/pricing/contact">
                <Button variant="outline" className="gap-2">
                  <Lock className="h-4 w-4" /> See paid tiers
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Install instructions */}
      <section className="container mx-auto px-4 pb-24 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight mb-6 text-center">Install in 30 seconds</h2>
        <ol className="space-y-3">
          {[
            "Click \"Download for Chrome\" above and unzip the file.",
            "Open chrome://extensions in Chrome (works in Edge, Brave, Arc too).",
            "Enable Developer mode in the top-right.",
            "Click Load unpacked and select the unzipped folder.",
            "Open ChatGPT, Claude, or Gemini and start typing — Guard is already watching.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/15 text-primary font-semibold text-xs flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
