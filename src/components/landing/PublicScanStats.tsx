import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Activity, ShieldAlert, TrendingDown } from "lucide-react";

interface RecentScan {
  domain: string;
  score: number;
  risk_label: string;
  detected_ai_count: number;
  findings_count: number;
  created_at: string;
}

interface ScanStats {
  total_scans: number;
  scans_this_week: number;
  average_score: number;
  pct_critical: number;
  pct_with_ai: number;
  recent: RecentScan[];
}

// Mask a domain for public display: keep TLD, blur middle
// e.g. "acme-corp.com" → "a••••••••.com"
function maskDomain(domain: string): string {
  const parts = domain.split(".");
  if (parts.length < 2) return domain;
  const tld = parts.slice(-1)[0];
  const name = parts.slice(0, -1).join(".");
  if (name.length <= 2) return `${name}.${tld}`;
  return `${name[0]}${"•".repeat(Math.min(8, name.length - 1))}.${tld}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function scoreColor(score: number): string {
  if (score < 40) return "text-red-400";
  if (score < 60) return "text-orange-400";
  if (score < 80) return "text-amber-400";
  return "text-emerald-400";
}

export function PublicScanStats() {
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc("get_public_scan_stats");
        if (!error && data) setStats(data as unknown as ScanStats);
      } catch {
        /* non-fatal */
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const id = setInterval(fetchStats, 30000);
    return () => clearInterval(id);
  }, []);

  if (loading || !stats || stats.total_scans === 0) return null;

  return (
    <section className="py-16 px-4 border-t border-border/40 bg-gradient-to-b from-background to-card/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs uppercase tracking-wider text-primary mb-4">
            <Activity className="w-3 h-3" /> Live data
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            What we're seeing across the web
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Aggregate, anonymized data from public scans run through HFAI's free AI exposure scanner.
          </p>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatTile
            icon={<Activity className="w-4 h-4" />}
            label="Total sites scanned"
            value={stats.total_scans.toLocaleString()}
            sub={`${stats.scans_this_week.toLocaleString()} this week`}
          />
          <StatTile
            icon={<TrendingDown className="w-4 h-4" />}
            label="Average score"
            value={`${stats.average_score}/100`}
            sub="Out of 100"
            valueClass={scoreColor(stats.average_score)}
          />
          <StatTile
            icon={<ShieldAlert className="w-4 h-4" />}
            label="With deployed AI"
            value={`${stats.pct_with_ai}%`}
            sub="Detected fingerprints"
            valueClass="text-amber-400"
          />
          <StatTile
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Critical findings"
            value={`${stats.pct_critical}%`}
            sub="Article 5 risk patterns"
            valueClass="text-red-400"
          />
        </div>

        {/* Live ticker */}
        {stats.recent.length > 0 && (
          <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-foreground/90">
                Recent scans
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </div>
            </div>
            <div className="space-y-1">
              {stats.recent.map((scan, i) => (
                <motion.div
                  key={`${scan.domain}-${scan.created_at}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/30 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-muted-foreground truncate">
                      {maskDomain(scan.domain)}
                    </span>
                    {scan.detected_ai_count > 0 && (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 shrink-0">
                        {scan.detected_ai_count} AI
                      </span>
                    )}
                    {scan.findings_count > 0 && (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-red-400/10 text-red-300 border border-red-400/20 shrink-0">
                        {scan.findings_count} issue{scan.findings_count === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-mono font-semibold ${scoreColor(scan.score)}`}>
                      {scan.score}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline w-16 text-right">
                      {timeAgo(scan.created_at)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 text-center">
              Domains are masked. Full scan results are only shown to whoever ran the scan.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function StatTile({
  icon,
  label,
  value,
  sub,
  valueClass = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`text-2xl md:text-3xl font-bold ${valueClass}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}
