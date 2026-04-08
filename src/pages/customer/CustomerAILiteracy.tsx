import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { SectionHeader } from "@/components/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import {
  GraduationCap, BookOpen, Users, CheckCircle, Clock,
  AlertTriangle, Award, Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const LITERACY_MODULES = [
  {
    id: "ai_basics",
    title: "AI System Fundamentals",
    article: "Art. 4",
    duration: "15 min",
    description: "What AI systems are, how they make decisions, and key terminology your team needs to know.",
    topics: ["Machine learning vs rule-based", "Training data and bias", "Model outputs and confidence", "Limitations of AI"],
  },
  {
    id: "eu_ai_act_overview",
    title: "EU AI Act Overview",
    article: "Art. 4",
    duration: "20 min",
    description: "The regulatory framework: risk tiers, obligations, timelines, and who is responsible.",
    topics: ["Risk classification tiers", "Provider vs deployer obligations", "Key compliance deadlines", "Penalties and enforcement"],
  },
  {
    id: "risk_awareness",
    title: "Risk Awareness for AI Users",
    article: "Art. 4, 9",
    duration: "15 min",
    description: "How to identify when AI outputs need human review and escalation procedures.",
    topics: ["Recognizing unreliable outputs", "When to escalate", "Bias indicators", "Override procedures"],
  },
  {
    id: "human_oversight_role",
    title: "Your Role in Human Oversight",
    article: "Art. 14",
    duration: "20 min",
    description: "Understanding the human oversight mandate and how your decisions are logged.",
    topics: ["Article 14 requirements", "Review and approval workflows", "Audit trail documentation", "Decision accountability"],
  },
  {
    id: "data_privacy",
    title: "Data Protection & AI",
    article: "Art. 10, GDPR",
    duration: "15 min",
    description: "How AI interacts with personal data and your obligations under GDPR alongside the AI Act.",
    topics: ["GDPR and AI intersection", "Data minimization", "Consent and lawful basis", "Subject access rights"],
  },
  {
    id: "incident_response",
    title: "Incident Recognition & Reporting",
    article: "Art. 62, 73",
    duration: "10 min",
    description: "How to recognize AI incidents and follow the reporting protocol.",
    topics: ["What constitutes a serious incident", "Internal reporting steps", "Authority notification triggers", "Documentation requirements"],
  },
];

const ROLE_TRACKS = [
  { role: "Developers", modules: ["ai_basics", "risk_awareness", "data_privacy"], icon: "💻" },
  { role: "Managers", modules: ["eu_ai_act_overview", "human_oversight_role", "incident_response"], icon: "📋" },
  { role: "All Staff", modules: ["ai_basics", "eu_ai_act_overview", "risk_awareness"], icon: "👥" },
];

export default function CustomerAILiteracy() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("hfai_literacy_progress");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const toggleModule = (id: string) => {
    setCompletedModules(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("hfai_literacy_progress", JSON.stringify(next));
      return next;
    });
  };

  const completedCount = LITERACY_MODULES.filter(m => completedModules[m.id]).length;
  const completionPct = Math.round((completedCount / LITERACY_MODULES.length) * 100);

  const handleExportCertificate = () => {
    if (completionPct < 100) {
      toast({ title: "Complete all modules first", description: "Finish all literacy modules to generate a completion certificate.", variant: "destructive" });
      return;
    }
    const cert = {
      type: "AI Literacy Completion Certificate",
      organization: profile?.name || "Organization",
      completed_at: new Date().toISOString(),
      modules_completed: LITERACY_MODULES.length,
      framework: "EU AI Act Article 4 — AI Literacy",
      platform: "HFAI — Human-First AI Governance",
    };
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-literacy-certificate-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Certificate exported", description: "AI literacy completion certificate downloaded." });
  };

  return (
    <SubscriptionGate feature="AI Literacy Training">
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <SectionHeader
            title="AI Literacy Training"
            description="Article 4 requires all staff interacting with AI systems to have sufficient AI literacy. Track your team's progress."
          />
          <Button onClick={handleExportCertificate} disabled={completionPct < 100} className="gap-2" variant={completionPct >= 100 ? "default" : "outline"}>
            <Award className="h-4 w-4" />
            Export Certificate
          </Button>
        </div>

        {/* Status Banner */}
        <div className={`rounded-lg p-4 border ${completionPct >= 100 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}`}>
          <div className="flex items-center gap-2 mb-2">
            {completionPct >= 100 ? (
              <CheckCircle className="h-4 w-4 text-primary" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <span className={`text-sm font-semibold ${completionPct >= 100 ? "text-primary" : "text-destructive"}`}>
              {completionPct >= 100 ? "Article 4 — AI Literacy requirement satisfied" : "Article 4 — AI Literacy requirement not yet met (enforceable now)"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">AI literacy obligations under Article 4 of the EU AI Act are already in effect. All providers and deployers must ensure staff have sufficient knowledge.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{LITERACY_MODULES.length}</p>
                  <p className="text-xs text-muted-foreground">Total Modules</p>
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
                  <p className="text-2xl font-bold text-foreground">{completedCount}/{LITERACY_MODULES.length}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">~95 min</p>
                  <p className="text-xs text-muted-foreground">Total Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completionPct}%</p>
                  <p className="text-xs text-muted-foreground">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Progress value={completionPct} className="h-2" />

        {/* Role-Based Learning Tracks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommended Learning Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {ROLE_TRACKS.map(track => {
                const trackCompleted = track.modules.filter(m => completedModules[m]).length;
                return (
                  <div key={track.role} className="rounded-lg border border-border/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{track.icon}</span>
                      <span className="text-sm font-semibold text-foreground">{track.role}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{trackCompleted}/{track.modules.length} modules completed</p>
                    <Progress value={(trackCompleted / track.modules.length) * 100} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Module Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Training Modules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {LITERACY_MODULES.map(mod => (
              <div
                key={mod.id}
                className={`flex items-start gap-3 p-4 rounded-lg transition-colors ${completedModules[mod.id] ? "bg-primary/5" : "hover:bg-muted/30"}`}
              >
                <Checkbox
                  id={mod.id}
                  checked={!!completedModules[mod.id]}
                  onCheckedChange={() => toggleModule(mod.id)}
                  className="mt-0.5"
                />
                <label htmlFor={mod.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${completedModules[mod.id] ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {mod.title}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{mod.article}</Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {mod.duration}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {mod.topics.map(topic => (
                      <Badge key={topic} variant="secondary" className="text-[10px] font-normal">{topic}</Badge>
                    ))}
                  </div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SubscriptionGate>
  );
}
