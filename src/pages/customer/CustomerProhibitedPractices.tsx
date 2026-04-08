import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SectionHeader } from "@/components/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldAlert, Ban, Eye, Brain, Users, Fingerprint,
  CheckCircle, AlertTriangle, XCircle, Zap
} from "lucide-react";

const PROHIBITED_PRACTICES = [
  { id: "subliminal", title: "Subliminal Manipulation", article: "Art. 5(1)(a)", description: "AI that deploys subliminal techniques beyond a person's consciousness to materially distort behaviour causing significant harm.", ruleKeywords: ["manipulation", "subliminal", "coercion"], icon: Brain, severity: "critical" as const },
  { id: "exploitation", title: "Exploitation of Vulnerabilities", article: "Art. 5(1)(a)", description: "AI exploiting vulnerabilities due to age, disability, or social/economic situation to distort behaviour causing significant harm.", ruleKeywords: ["exploit", "vulnerable", "disability", "elderly"], icon: Users, severity: "critical" as const },
  { id: "social_scoring", title: "Social Scoring", article: "Art. 5(1)(c)", description: "AI-based evaluation or classification of persons based on social behaviour leading to detrimental or unfavourable treatment.", ruleKeywords: ["social score", "social scoring", "social credit", "citizen score"], icon: Ban, severity: "critical" as const },
  { id: "predictive_policing", title: "Individual Predictive Policing", article: "Art. 5(1)(d)", description: "AI predicting criminal offence risk based solely on profiling or personality traits assessment.", ruleKeywords: ["predictive policing", "crime prediction", "criminal profiling"], icon: Eye, severity: "critical" as const },
  { id: "facial_scraping", title: "Untargeted Facial Scraping", article: "Art. 5(1)(e)", description: "Creating or expanding facial recognition databases through untargeted scraping from internet or CCTV footage.", ruleKeywords: ["facial scraping", "face database", "biometric scraping"], icon: Fingerprint, severity: "critical" as const },
  { id: "emotion_recognition", title: "Workplace/Education Emotion Recognition", article: "Art. 5(1)(f)", description: "Inferring emotions in workplace or educational institutions, except for medical or safety reasons.", ruleKeywords: ["emotion recognition", "emotion detection", "sentiment workplace"], icon: Eye, severity: "high" as const },
  { id: "biometric_categorisation", title: "Biometric Categorisation (Sensitive Data)", article: "Art. 5(1)(g)", description: "Categorising individuals based on biometric data to deduce race, political opinions, religious beliefs, sexual orientation.", ruleKeywords: ["biometric categorisation", "biometric classification", "race detection"], icon: Fingerprint, severity: "critical" as const },
  { id: "realtime_rbi", title: "Real-time Remote Biometric ID", article: "Art. 5(1)(h)", description: "Real-time remote biometric identification in publicly accessible spaces for law enforcement (with narrow exceptions).", ruleKeywords: ["real-time biometric", "remote identification", "facial recognition public"], icon: Eye, severity: "critical" as const },
];

export default function CustomerProhibitedPractices() {
  const { profile } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeActive, setRealtimeActive] = useState(false);

  useEffect(() => {
    if (!profile?.org_id) return;
    Promise.resolve(supabase.from("rules").select("*").or(`org_id.eq.${profile.org_id},org_id.is.null`))
      .then(({ data }) => {
        setRules(data || []);
        // Check if any prohibited-practice rules have enforcement_mode = "block"
        const hasBlockingRules = (data || []).some(r =>
          r.enabled && r.enforcement_mode === "block" &&
          PROHIBITED_PRACTICES.some(p =>
            p.ruleKeywords.some(kw =>
              r.name?.toLowerCase().includes(kw) || r.condition?.toLowerCase().includes(kw) || r.description?.toLowerCase().includes(kw)
            )
          )
        );
        setRealtimeActive(hasBlockingRules);
      })
      .finally(() => setLoading(false));
  }, [profile?.org_id]);

  const getPracticeStatus = (practice: typeof PROHIBITED_PRACTICES[0]) => {
    const matchingRules = rules.filter(r =>
      r.enabled && practice.ruleKeywords.some((kw: string) =>
        (r.name?.toLowerCase().includes(kw) || r.condition?.toLowerCase().includes(kw) || r.description?.toLowerCase().includes(kw))
      )
    );
    const hasBlockingRule = matchingRules.some(r => r.enforcement_mode === "block");
    if (hasBlockingRule) return "enforced";
    if (matchingRules.length > 0) return "monitored";
    return "unmonitored";
  };

  const enforcedCount = PROHIBITED_PRACTICES.filter(p => getPracticeStatus(p) === "enforced").length;
  const monitoredCount = PROHIBITED_PRACTICES.filter(p => getPracticeStatus(p) === "monitored").length;
  const unmonitoredCount = PROHIBITED_PRACTICES.length - enforcedCount - monitoredCount;

  if (loading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading...</p>;

  return (
    <SubscriptionGate feature="Prohibited Practices">
      <div className="space-y-8">
        <SectionHeader
          title="Prohibited AI Practices"
          description="Article 5 bans specific AI practices outright. These are already enforceable — violations carry fines up to €35M or 7% of global turnover."
        />

        {/* Status Banner */}
        <div className={`rounded-lg p-4 border ${unmonitoredCount === 0 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}`}>
          <div className="flex items-center gap-2">
            {unmonitoredCount === 0 ? (
              <CheckCircle className="h-4 w-4 text-primary" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <span className={`text-sm font-semibold ${unmonitoredCount === 0 ? "text-primary" : "text-destructive"}`}>
              {unmonitoredCount === 0
                ? "All prohibited practices have active detection rules"
                : `${unmonitoredCount} prohibited practice${unmonitoredCount > 1 ? "s" : ""} lack active detection rules`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Article 5 prohibitions are in force since February 2025. HFAI scans your active rules to verify coverage.
            {realtimeActive && " Real-time blocking is active in your proxy/ingestion layer for enforced practices."}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{PROHIBITED_PRACTICES.length}</p>
                  <p className="text-xs text-muted-foreground">Prohibited Practices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{enforcedCount}</p>
                  <p className="text-xs text-muted-foreground">Real-time Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{monitoredCount}</p>
                  <p className="text-xs text-muted-foreground">Monitored</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{unmonitoredCount}</p>
                  <p className="text-xs text-muted-foreground">Gaps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Practice Cards */}
        <div className="space-y-3">
          {PROHIBITED_PRACTICES.map(practice => {
            const status = getPracticeStatus(practice);
            const Icon = practice.icon;
            return (
              <Card key={practice.id} className={status === "unmonitored" ? "border-destructive/30" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      status === "enforced" ? "bg-primary/10" :
                      status === "monitored" ? "bg-primary/10" : "bg-destructive/10"
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        status === "enforced" ? "text-primary" :
                        status === "monitored" ? "text-primary" : "text-destructive"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-foreground">{practice.title}</span>
                        <Badge variant="outline" className="text-[10px]">{practice.article}</Badge>
                        <Badge
                          variant={status === "unmonitored" ? "destructive" : "default"}
                          className="text-[10px] ml-auto"
                        >
                          {status === "enforced" ? "⚡ Real-time Block" : status === "monitored" ? "Rule Active" : "No Rule"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{practice.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {practice.ruleKeywords.map(kw => (
                          <Badge key={kw} variant="secondary" className="text-[10px] font-normal">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </SubscriptionGate>
  );
}
