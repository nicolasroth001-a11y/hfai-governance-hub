import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, AlertTriangle, CheckCircle2, ShieldAlert, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Finding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  detail: string;
  article?: string;
}

interface ScanResult {
  url: string;
  finalUrl: string;
  scannedAt: string;
  score: number;
  riskLabel: "Critical" | "High" | "Medium" | "Low";
  estimatedFineEUR: number;
  detectedAI: string[];
  findings: Finding[];
  summary: string;
  pageTitle?: string;
}

const STAGES = [
  "Loading the site…",
  "Detecting AI fingerprints…",
  "Checking transparency notices…",
  "Cross-referencing EU AI Act Articles 4, 5 & 50…",
  "Calculating exposure…",
];

interface Props {
  variant?: "full" | "compact";
  initialUrl?: string;
}

export function AIScannerWidget({ variant = "full", initialUrl = "" }: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function runScan(e?: React.FormEvent) {
    e?.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setStage(0);

    // Animate stages while we wait
    const stageTimer = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 1100);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("scan-website-ai", {
        body: { url: url.trim() },
      });
      if (fnError) throw fnError;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as ScanResult);
    } catch (err: any) {
      setError(err?.message || "Scan failed. Try a different URL.");
    } finally {
      clearInterval(stageTimer);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={runScan} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="yourcompany.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10 h-12 text-base bg-secondary/30 border-border/50"
            disabled={loading}
            autoComplete="url"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 px-6 gap-2"
          disabled={loading || !url.trim()}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
          {loading ? "Scanning…" : "Scan for AI risk"}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Free. No signup. Scans the homepage for AI use, missing disclosures, and EU AI Act exposure.
      </p>

      {/* Loading stages */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <Card className="p-5 bg-secondary/20 border-border/40">
              <div className="space-y-2.5">
                {STAGES.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 text-sm">
                    {i < stage ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : i === stage ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-border/40" />
                    )}
                    <span className={i <= stage ? "text-foreground" : "text-muted-foreground/50"}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <Card className="mt-6 p-4 border-destructive/40 bg-destructive/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Couldn't scan that site</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 space-y-4"
          >
            <ScoreCard result={result} />
            <DetectedAI result={result} />
            <FindingsList findings={result.findings} />

            {/* CTA */}
            <Card className="p-6 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div>
                  <h4 className="font-semibold text-base">Want this fixed — and monitored automatically?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    HFAI watches every AI call your team makes and blocks violations in real time.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button onClick={() => navigate("/pricing/contact")} className="gap-2">
                    Get protected <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {variant === "compact" && (
              <div className="text-center">
                <Button variant="link" onClick={() => navigate("/scan")}>
                  See full report on /scan →
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreCard({ result }: { result: ScanResult }) {
  const color =
    result.score < 40
      ? "text-destructive"
      : result.score < 60
      ? "text-amber-500"
      : result.score < 80
      ? "text-amber-300"
      : "text-emerald-500";

  const ringColor =
    result.score < 40
      ? "stroke-destructive"
      : result.score < 60
      ? "stroke-amber-500"
      : result.score < 80
      ? "stroke-amber-300"
      : "stroke-emerald-500";

  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (result.score / 100) * circumference;

  return (
    <Card className="p-6 bg-secondary/20 border-border/40">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="56" className="stroke-border/30 fill-none" strokeWidth="10" />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              className={`${ringColor} fill-none`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${color}`}>{result.score}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <Badge
              variant={result.riskLabel === "Critical" || result.riskLabel === "High" ? "destructive" : "secondary"}
              className="uppercase tracking-wider"
            >
              {result.riskLabel} risk
            </Badge>
            {result.pageTitle && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {result.pageTitle}
              </span>
            )}
          </div>
          <p className="text-sm">{result.summary}</p>
          {result.estimatedFineEUR > 0 && (
            <p className="text-sm font-medium">
              <span className="text-destructive">
                €{(result.estimatedFineEUR / 1_000_000).toFixed(1)}M
              </span>{" "}
              <span className="text-muted-foreground">maximum fine exposure under the EU AI Act</span>
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function DetectedAI({ result }: { result: ScanResult }) {
  if (result.detectedAI.length === 0) {
    return (
      <Card className="p-4 bg-secondary/20 border-border/40">
        <p className="text-sm text-muted-foreground">
          <CheckCircle2 className="inline h-4 w-4 mr-2 text-emerald-500" />
          No AI fingerprints detected on the homepage.
        </p>
      </Card>
    );
  }
  return (
    <Card className="p-4 bg-secondary/20 border-border/40">
      <h4 className="text-sm font-medium mb-3">AI systems detected</h4>
      <div className="flex flex-wrap gap-2">
        {result.detectedAI.map((ai) => (
          <Badge key={ai} variant="outline" className="font-normal">
            {ai}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

function FindingsList({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <Card className="p-5 border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <p className="text-sm">No major compliance issues detected on the public homepage.</p>
        </div>
      </Card>
    );
  }
  const sevColor: Record<Finding["severity"], string> = {
    critical: "border-destructive/40 bg-destructive/10",
    high: "border-amber-500/40 bg-amber-500/10",
    medium: "border-amber-300/30 bg-amber-300/5",
    low: "border-border/40 bg-secondary/20",
    info: "border-border/30 bg-secondary/10",
  };
  const sevLabel: Record<Finding["severity"], string> = {
    critical: "CRITICAL",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
    info: "INFO",
  };
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Compliance findings ({findings.length})</h4>
      {findings.map((f, i) => (
        <motion.div
          key={f.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className={`p-4 ${sevColor[f.severity]}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={`h-4 w-4 shrink-0 mt-0.5 ${
                  f.severity === "critical"
                    ? "text-destructive"
                    : f.severity === "high"
                    ? "text-amber-500"
                    : "text-amber-300"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="font-medium text-sm">{f.title}</p>
                  <Badge variant="outline" className="text-[10px] tracking-wider">
                    {sevLabel[f.severity]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{f.detail}</p>
                {f.article && (
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mt-2">
                    Reference: {f.article}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
