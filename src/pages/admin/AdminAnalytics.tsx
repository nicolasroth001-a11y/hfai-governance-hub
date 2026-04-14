import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Eye, Users, Globe, TrendingUp, Loader2, Mail,
  UserPlus, Newspaper, FileCheck, CreditCard, ArrowDownRight,
  ArrowUpRight, Clock, CheckCircle, XCircle, AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { formatDistanceToNow, format } from "date-fns";

interface AnalyticsData {
  pages: { route: string; views: number; unique: number }[];
  traffic: { date: string; views: number }[];
  referrers: { referrer: string; count: number }[];
  totalViews: number;
  uniqueSessions: number;
}

interface SignupEntry {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  org_name?: string;
}

interface EmailStat {
  template_name: string;
  status: string;
  count: number;
}

interface NewsletterSub {
  email: string;
  status: string;
  created_at: string;
}

interface AssessmentEntry {
  id: string;
  email: string | null;
  company_name: string | null;
  score: number;
  max_score: number;
  score_percentage: number | null;
  category_scores: Record<string, number> | null;
  created_at: string;
}

interface FunnelStep {
  label: string;
  value: number;
  color: string;
}

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [signups, setSignups] = useState<SignupEntry[]>([]);
  const [emailStats, setEmailStats] = useState<{ total: number; sent: number; failed: number; suppressed: number; recentEmails: any[] }>({ total: 0, sent: 0, failed: 0, suppressed: 0, recentEmails: [] });
  const [newsletterSubs, setNewsletterSubs] = useState<NewsletterSub[]>([]);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Parallel fetch all data
        const [
          analyticsResult,
          profilesResult,
          emailLogResult,
          newsletterResult,
          pageViewsResult,
          orgsResult,
          assessmentResultsResult,
        ] = await Promise.all([
          supabase.functions.invoke("analytics-data"),
          supabase.from("profiles").select("id, email, name, role, created_at, org_id").order("created_at", { ascending: false }),
          supabase.from("email_send_log").select("*").order("created_at", { ascending: false }).limit(500),
          supabase.from("newsletter_subscribers").select("email, status, created_at").order("created_at", { ascending: false }),
          supabase.from("page_views").select("page, created_at").order("created_at", { ascending: false }),
          supabase.from("organizations").select("id, name"),
          supabase.from("assessment_results").select("id, email, company_name, score, max_score, score_percentage, category_scores, created_at").order("created_at", { ascending: false }),
        ]);

        // Analytics data
        if (analyticsResult.error) throw analyticsResult.error;
        setData(analyticsResult.data);

        // Signups with org names
        const orgsMap: Record<string, string> = {};
        (orgsResult.data ?? []).forEach((o: any) => { orgsMap[o.id] = o.name; });
        const enrichedSignups: SignupEntry[] = (profilesResult.data ?? []).map((p: any) => ({
          id: p.id,
          email: p.email,
          name: p.name,
          role: p.role,
          created_at: p.created_at,
          org_name: p.org_id ? orgsMap[p.org_id] : undefined,
        }));
        setSignups(enrichedSignups);

        // Email stats (deduplicated by template_name grouping)
        const emails = emailLogResult.data ?? [];
        const deduped = new Map<string, any>();
        emails.forEach((e: any) => {
          const key = e.message_id || e.id;
          if (!deduped.has(key) || new Date(e.created_at) > new Date(deduped.get(key).created_at)) {
            deduped.set(key, e);
          }
        });
        const dedupedArr = Array.from(deduped.values());
        const sent = dedupedArr.filter((e: any) => e.status === "sent").length;
        const failed = dedupedArr.filter((e: any) => ["dlq", "failed"].includes(e.status)).length;
        const suppressed = dedupedArr.filter((e: any) => e.status === "suppressed").length;
        setEmailStats({
          total: dedupedArr.length,
          sent,
          failed,
          suppressed,
          recentEmails: dedupedArr.slice(0, 15),
        });

        // Newsletter
        setNewsletterSubs(newsletterResult.data ?? []);
        setAssessmentResults((assessmentResultsResult.data ?? []) as AssessmentEntry[]);

        // Assessment count from page_views
        const assessments = (pageViewsResult.data ?? []).filter((pv: any) =>
          pv.page === "/readiness-assessment" || pv.page?.startsWith("/readiness-assessment")
        );
        setAssessmentCount(assessments.length);

        // Funnel
        const analyticsData = analyticsResult.data as AnalyticsData;
        const homepageViews = analyticsData?.pages?.find((p) => p.route === "/")?.views ?? 0;
        const pilotViews = analyticsData?.pages?.find((p) => p.route === "/pilot")?.views ?? 0;
        const assessmentViews = assessments.length;
        const signupViews = analyticsData?.pages?.find((p) => p.route === "/signup/customer")?.views ?? 0;
        const totalSignups = enrichedSignups.filter((s) => s.role === "customer").length;

        setFunnel([
          { label: "Homepage", value: homepageViews, color: "hsl(var(--primary))" },
          { label: "Assessment", value: assessmentViews, color: "hsl(var(--chart-2))" },
          { label: "Pilot Page", value: pilotViews, color: "hsl(var(--chart-3))" },
          { label: "Signup Page", value: signupViews, color: "hsl(var(--chart-4))" },
          { label: "Registered", value: totalSignups, color: "hsl(var(--chart-5))" },
        ]);
      } catch (e: any) {
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <SectionHeader title="Admin Analytics" description="Complete overview of platform metrics" />
        <ContentCard title="Error">
          <p className="text-sm text-destructive">{error || "No data available"}</p>
        </ContentCard>
      </div>
    );
  }

  const activeNewsletter = newsletterSubs.filter((s) => s.status === "active").length;
  const customerSignups = signups.filter((s) => s.role === "customer").length;

  const roleBreakdown = signups.reduce<Record<string, number>>((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1;
    return acc;
  }, {});
  const roleData = Object.entries(roleBreakdown).map(([name, value]) => ({ name, value }));

  const statusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
      case "failed": case "dlq": return "bg-destructive/15 text-destructive";
      case "suppressed": return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
      case "pending": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Admin Analytics" description="Complete overview of all platform metrics, signups, emails, and funnel data" />

      {/* ── Row 1: Top-level KPIs ─────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard title="Total Page Views" value={data.totalViews.toLocaleString()} icon={Eye} />
        <StatCard title="Unique Sessions" value={data.uniqueSessions.toLocaleString()} icon={Users} />
        <StatCard title="Registered Users" value={signups.length} icon={UserPlus} />
        <StatCard title="Customer Signups" value={customerSignups} icon={CreditCard} />
        <StatCard title="Newsletter Subs" value={activeNewsletter} icon={Newspaper} />
        <StatCard title="Assessments Taken" value={assessmentCount} icon={FileCheck} />
      </div>

      {/* ── Row 2: Conversion Funnel ──────────────────────── */}
      <ContentCard icon={ArrowDownRight} title="Conversion Funnel">
        <div className="space-y-3">
          {funnel.map((step, i) => {
            const maxVal = funnel[0]?.value || 1;
            const pct = maxVal > 0 ? Math.round((step.value / maxVal) * 100) : 0;
            const convFromPrev = i > 0 && funnel[i - 1].value > 0
              ? Math.round((step.value / funnel[i - 1].value) * 100)
              : null;
            return (
              <div key={step.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 shrink-0 text-right">{step.label}</span>
                <div className="flex-1 h-8 bg-muted/50 rounded-md overflow-hidden relative">
                  <div
                    className="h-full rounded-md transition-all duration-500"
                    style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: step.color }}
                  />
                  <span className="absolute inset-0 flex items-center px-3 text-xs font-medium text-foreground">
                    {step.value.toLocaleString()}
                    {convFromPrev !== null && (
                      <span className="ml-2 text-muted-foreground">({convFromPrev}% from prev)</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ContentCard>

      {/* ── Row 3: Traffic Chart + User Breakdown ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContentCard icon={TrendingUp} title="Traffic (Last 30 Days)">
            {data.traffic.length === 0 ? (
              <p className="text-sm text-muted-foreground">No traffic data yet</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.traffic}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </ContentCard>
        </div>
        <ContentCard icon={Users} title="Users by Role">
          {roleData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet</p>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {roleData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ContentCard>
      </div>

      {/* ── Row 4: Recent Signups ─────────────────────────── */}
      <ContentCard icon={UserPlus} title="All Registered Users">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-medium text-muted-foreground">Email</th>
                <th className="py-2 pr-4 font-medium text-muted-foreground">Name</th>
                <th className="py-2 pr-4 font-medium text-muted-foreground">Role</th>
                <th className="py-2 pr-4 font-medium text-muted-foreground">Organization</th>
                <th className="py-2 font-medium text-muted-foreground text-right">Signed Up</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((s) => (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono text-xs text-card-foreground">{s.email}</td>
                  <td className="py-2 pr-4 text-card-foreground">{s.name || "—"}</td>
                  <td className="py-2 pr-4">
                    <Badge variant={s.role === "admin" ? "default" : s.role === "reviewer" ? "secondary" : "outline"} className="text-[10px]">
                      {s.role}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4 text-card-foreground text-xs">{s.org_name || "—"}</td>
                  <td className="py-2 text-right text-xs text-muted-foreground">
                    {format(new Date(s.created_at), "MMM d, yyyy")}
                    <span className="block text-[10px]">{formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>

      {/* ── Row 5: Email Delivery Stats ───────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Emails Sent" value={emailStats.total} icon={Mail} />
        <StatCard title="Delivered" value={emailStats.sent} icon={CheckCircle} />
        <StatCard title="Failed" value={emailStats.failed} icon={XCircle} />
        <StatCard title="Suppressed" value={emailStats.suppressed} icon={AlertTriangle} />
      </div>

      <ContentCard icon={Mail} title="Recent Email Activity">
        {emailStats.recentEmails.length === 0 ? (
          <p className="text-sm text-muted-foreground">No emails sent yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-medium text-muted-foreground">Template</th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground">Recipient</th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground">Status</th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground">Error</th>
                  <th className="py-2 font-medium text-muted-foreground text-right">When</th>
                </tr>
              </thead>
              <tbody>
                {emailStats.recentEmails.map((e: any) => (
                  <tr key={e.id} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-mono text-xs text-card-foreground">{e.template_name}</td>
                    <td className="py-2 pr-4 text-xs text-card-foreground">{e.recipient_email}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(e.status)}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs text-destructive max-w-[200px] truncate">{e.error_message || "—"}</td>
                    <td className="py-2 text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContentCard>

      {/* ── Row 6: Newsletter Subscribers ─────────────────── */}
      <ContentCard icon={Newspaper} title={`Newsletter Subscribers (${activeNewsletter} active)`}>
        {newsletterSubs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subscribers yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-medium text-muted-foreground">Email</th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground">Status</th>
                  <th className="py-2 font-medium text-muted-foreground text-right">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {newsletterSubs.map((s) => (
                  <tr key={s.email} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-mono text-xs text-card-foreground">{s.email}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {s.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-right text-xs text-muted-foreground">
                      {format(new Date(s.created_at), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContentCard>

      {/* ── Row 7: Assessment Results ─────────────────────── */}
      <ContentCard icon={FileCheck} title={`Assessment Results (${assessmentResults.length} completed)`}>
        {assessmentResults.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assessments completed yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-medium text-muted-foreground">Email</th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground">Company</th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Score</th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground text-right">%</th>
                  <th className="py-2 font-medium text-muted-foreground text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {assessmentResults.map((a) => {
                  const pct = a.score_percentage ?? (a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0);
                  return (
                    <tr key={a.id} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-card-foreground">{a.email || "—"}</td>
                      <td className="py-2 pr-4 text-xs text-card-foreground">{a.company_name || "—"}</td>
                      <td className="py-2 pr-4 text-right text-card-foreground text-xs">{a.score}/{a.max_score}</td>
                      <td className="py-2 pr-4 text-right">
                        <Badge variant="outline" className={`text-[10px] ${pct >= 65 ? "text-emerald-600" : pct >= 35 ? "text-yellow-600" : "text-destructive"}`}>
                          {pct}%
                        </Badge>
                      </td>
                      <td className="py-2 text-right text-xs text-muted-foreground">
                        {format(new Date(a.created_at), "MMM d, yyyy")}
                        <span className="block text-[10px]">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ContentCard>

      {/* ── Row 8: Top Pages + Referrers ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard icon={BarChart3} title="Top Pages">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-medium text-muted-foreground">Page</th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Views</th>
                  <th className="py-2 font-medium text-muted-foreground text-right">Unique</th>
                </tr>
              </thead>
              <tbody>
                {data.pages.map((p) => (
                  <tr key={p.route} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-mono text-xs text-card-foreground truncate max-w-[250px]">{p.route}</td>
                    <td className="py-2 pr-4 text-right text-card-foreground">{p.views}</td>
                    <td className="py-2 text-right text-card-foreground">{p.unique}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>

        <ContentCard icon={Globe} title="Top Referrers">
          {data.referrers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No referrers yet</p>
          ) : (
            <div className="space-y-2">
              {data.referrers.slice(0, 10).map((r) => (
                <div key={r.referrer} className="flex items-center justify-between py-1.5 border-b border-border/30">
                  <span className="text-xs text-card-foreground truncate max-w-[70%]">{r.referrer}</span>
                  <span className="text-xs font-medium text-muted-foreground">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </ContentCard>
      </div>
    </div>
  );
}
