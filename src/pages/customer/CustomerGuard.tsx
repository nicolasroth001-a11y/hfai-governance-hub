import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Shield, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/SectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Stat {
  category: string;
  block_count: number;
  stat_date: string;
}

const CATEGORY_META: Record<string, { label: string; tag: string; color: string }> = {
  eu_ai_act:  { label: "EU AI Act Article 5", tag: "Up to €35M / 7% turnover",  color: "text-amber-500" },
  gdpr:       { label: "GDPR / PII",          tag: "Up to €20M / 4% turnover",  color: "text-rose-400" },
  coppa:      { label: "COPPA / Minors",      tag: "Up to $51,744 per violation", color: "text-sky-400" },
  safety:     { label: "Safety & Self-harm",  tag: "Zero tolerance",            color: "text-violet-400" },
  internal:   { label: "Internal Policy",     tag: "Org-defined",               color: "text-muted-foreground" },
};

export default function CustomerGuard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stat[]>([]);
  const [deviceCount, setDeviceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!profile?.org_id) return;
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const [statsRes, devRes] = await Promise.all([
          supabase
            .from("guard_block_stats")
            .select("category, block_count, stat_date")
            .eq("org_id", profile.org_id)
            .gte("stat_date", since),
          supabase
            .from("guard_devices")
            .select("id", { count: "exact", head: true })
            .eq("org_id", profile.org_id),
        ]);
        if (cancelled) return;
        setStats((statsRes.data as Stat[]) || []);
        setDeviceCount(devRes.count || 0);
      } catch (e) {
        console.error("Guard dashboard fetch failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [profile?.org_id]);

  const totalBlocks = stats.reduce((sum, s) => sum + s.block_count, 0);
  const byCategory = stats.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + s.block_count;
    return acc;
  }, {});

  const lockedTiles = [
    "What was actually blocked",
    "Who triggered each block",
    "Hash-chained audit trail",
    "Reviewer queue & decisions",
    "Regulator-ready export pack",
    "Retention beyond 30 days",
  ];

  return (
    <div className="space-y-section">
      <SectionHeader
        title="HFAI Guard"
        description="Free real-time AI compliance enforcement. Last 7 days."
      />

      {/* Hero counter */}
      <Card className="rounded-[20px] overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Blocks this week</span>
          </div>
          <motion.div
            key={totalBlocks}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-6xl font-bold tracking-tight"
          >
            {loading ? "—" : totalBlocks}
          </motion.div>
          <p className="text-sm text-muted-foreground mt-3">
            {deviceCount} device{deviceCount === 1 ? "" : "s"} reporting · 30-day rolling window
          </p>
        </CardContent>
      </Card>

      {/* Regulation breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(CATEGORY_META).map((cat) => {
          const meta = CATEGORY_META[cat];
          const count = byCategory[cat] || 0;
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="rounded-[16px]">
                <CardContent className="p-5 flex items-start justify-between">
                  <div>
                    <div className={`text-xs uppercase tracking-wider mb-1 ${meta.color}`}>
                      {meta.label}
                    </div>
                    <div className="text-3xl font-semibold">{count}</div>
                    <div className="text-xs text-muted-foreground mt-1">{meta.tag}</div>
                  </div>
                  <AlertTriangle className={`h-4 w-4 ${meta.color} opacity-70`} />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Upgrade wall */}
      <Card className="rounded-[20px] border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-lg">You're seeing the bare minimum.</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Guard is silently logging every block to your workspace. Upgrade to Starter to
                unlock the full picture — what was blocked, who triggered it, and a regulator-ready audit trail.
              </p>
            </div>
            <Link to="/pricing/contact">
              <Button size="lg" className="gap-2">
                Unlock full dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lockedTiles.map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm"
              >
                <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{t}</span>
                <Badge variant="outline" className="ml-auto text-[10px] uppercase tracking-wide">
                  Starter+
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        HFAI Guard is free, forever. We never see prompt content on the free tier — just a count per
        regulation category. Upgrade to enable full event logging and exports.
      </p>
    </div>
  );
}
