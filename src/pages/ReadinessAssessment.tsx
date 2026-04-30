import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle,
  XCircle, Mail, Loader2, Building2, Users, Globe, Cpu,
  FileCheck, Scale, Eye, Lock, BarChart3, Share2, Copy, Twitter, Linkedin,
  TrendingDown, Gavel, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { usePageView } from "@/hooks/usePageView";

interface Question {
  id: string;
  category: string;
  categoryIcon: typeof Shield;
  question: string;
  subtext: string;
  options: { label: string; value: number; detail?: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "ai_decisions",
    category: "AI Risk Classification",
    categoryIcon: AlertTriangle,
    question: "Do your AI systems make or influence decisions that affect people?",
    subtext: "Hiring, lending, medical, content moderation, risk scoring, insurance…",
    options: [
      { label: "Yes — directly affects outcomes", value: 0, detail: "Likely high-risk under EU AI Act" },
      { label: "Partially — assists human decisions", value: 1, detail: "May be high-risk depending on context" },
      { label: "No — internal tools only", value: 2, detail: "Lower risk, but still needs documentation" },
    ],
  },
  {
    id: "audit_trail",
    category: "Audit & Logging",
    categoryIcon: FileCheck,
    question: "Can you produce a complete audit trail of every AI decision from the last 30 days?",
    subtext: "Article 12 requires logging. Article 14 requires human oversight evidence.",
    options: [
      { label: "Yes — full logs with timestamps", value: 2 },
      { label: "Partial — some logging exists", value: 1 },
      { label: "No — we don't log AI decisions", value: 0, detail: "Critical gap for compliance" },
    ],
  },
  {
    id: "human_oversight",
    category: "Human Oversight",
    categoryIcon: Eye,
    question: "Does a qualified human review AI outputs before they reach end users?",
    subtext: "Article 14 mandates human-in-the-loop oversight for high-risk systems.",
    options: [
      { label: "Yes — mandatory review process", value: 2 },
      { label: "Sometimes — ad-hoc reviews", value: 1 },
      { label: "No — fully automated", value: 0, detail: "Non-compliant for high-risk AI" },
    ],
  },
  {
    id: "risk_management",
    category: "Risk Management",
    categoryIcon: Scale,
    question: "Do you have a documented AI risk management system?",
    subtext: "Article 9 requires continuous, iterative risk management throughout the AI lifecycle.",
    options: [
      { label: "Yes — formal risk framework", value: 2 },
      { label: "Informal — some documentation", value: 1 },
      { label: "No — nothing documented", value: 0 },
    ],
  },
  {
    id: "data_governance",
    category: "Data Governance",
    categoryIcon: Lock,
    question: "Do you track the origin, quality, and consent basis of your AI training data?",
    subtext: "Article 10 requires documented data governance and quality controls.",
    options: [
      { label: "Yes — full data lineage tracked", value: 2 },
      { label: "Partial — some data documented", value: 1 },
      { label: "No — data sources not tracked", value: 0 },
    ],
  },
  {
    id: "transparency",
    category: "Transparency",
    categoryIcon: Globe,
    question: "Can users of your AI system understand how decisions are made?",
    subtext: "Article 13 requires transparency and explainability for high-risk AI.",
    options: [
      { label: "Yes — clear documentation exists", value: 2 },
      { label: "Partial — some explanations", value: 1 },
      { label: "No — black box system", value: 0 },
    ],
  },
  {
    id: "incident_reporting",
    category: "Incident Response",
    categoryIcon: AlertTriangle,
    question: "Do you have a process for reporting serious AI incidents to authorities?",
    subtext: "Article 62 requires reporting serious incidents within defined timeframes.",
    options: [
      { label: "Yes — documented process", value: 2 },
      { label: "Informal — no formal process", value: 1 },
      { label: "No — no process exists", value: 0 },
    ],
  },
];

const MAX_SCORE = QUESTIONS.length * 2;

function getScoreLabel(pct: number) {
  if (pct >= 80) return { label: "Strong", color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle };
  if (pct >= 50) return { label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: AlertTriangle };
  return { label: "Critical Gaps", color: "text-red-400", bg: "bg-red-500/10", icon: XCircle };
}

function getCategoryScore(answers: Record<string, number>, categoryQuestions: Question[]) {
  let total = 0, max = 0;
  categoryQuestions.forEach((q) => {
    if (answers[q.id] !== undefined) { total += answers[q.id]; max += 2; }
  });
  return max > 0 ? Math.round((total / max) * 100) : 0;
}

// EU AI Act fine ceilings (Article 99): up to €35M or 7% of turnover for prohibited practices,
// €15M or 3% for high-risk non-compliance, €7.5M or 1.5% for incorrect info to authorities.
// We use a weighted exposure based on which gaps are present.
function calculateFineExposure(answers: Record<string, number>): number {
  let exposure = 0;
  // High-risk classification + no audit trail = €15M exposure (Art 12 + Art 16)
  if (answers.ai_decisions === 0 && answers.audit_trail === 0) exposure += 15_000_000;
  else if (answers.ai_decisions === 0) exposure += 7_500_000;
  // No human oversight on high-risk = €15M (Art 14)
  if (answers.ai_decisions === 0 && answers.human_oversight === 0) exposure += 15_000_000;
  // No risk management = €7.5M (Art 9)
  if (answers.risk_management === 0) exposure += 3_500_000;
  // No data governance = €7.5M (Art 10)
  if (answers.data_governance === 0) exposure += 2_500_000;
  // No transparency = €7.5M (Art 13)
  if (answers.transparency === 0) exposure += 2_000_000;
  // No incident reporting = €7.5M (Art 62)
  if (answers.incident_reporting === 0) exposure += 1_500_000;
  return exposure;
}

function formatEuro(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}K`;
  return `€${n}`;
}

interface Gap {
  article: string;
  title: string;
  detail: string;
  severity: "critical" | "high" | "medium";
}

function getCriticalGaps(answers: Record<string, number>): Gap[] {
  const gaps: Gap[] = [];
  if (answers.ai_decisions === 0 && answers.human_oversight === 0) {
    gaps.push({
      article: "Article 14",
      title: "No human oversight on high-risk AI",
      detail: "Your AI affects people but runs without mandatory human-in-the-loop review. Automatic non-compliance.",
      severity: "critical",
    });
  }
  if (answers.audit_trail === 0) {
    gaps.push({
      article: "Article 12",
      title: "No audit trail of AI decisions",
      detail: "You cannot prove what your AI did, when, or why. Regulators require complete logs of every decision.",
      severity: "critical",
    });
  }
  if (answers.risk_management === 0) {
    gaps.push({
      article: "Article 9",
      title: "No documented risk management system",
      detail: "Continuous, iterative risk management is required across the entire AI lifecycle. Yours isn't documented.",
      severity: "high",
    });
  }
  if (answers.data_governance === 0) {
    gaps.push({
      article: "Article 10",
      title: "Training data not governed",
      detail: "Origin, quality, and consent basis of training data must be documented. Yours isn't.",
      severity: "high",
    });
  }
  if (answers.transparency === 0) {
    gaps.push({
      article: "Article 13",
      title: "Black-box decision making",
      detail: "Users have a right to understand AI decisions affecting them. Your system can't explain itself.",
      severity: "high",
    });
  }
  if (answers.incident_reporting === 0) {
    gaps.push({
      article: "Article 62",
      title: "No incident reporting process",
      detail: "Serious AI incidents must be reported to authorities within strict timeframes. You have no process.",
      severity: "medium",
    });
  }
  return gaps.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return order[a.severity] - order[b.severity];
  }).slice(0, 3);
}

export default function ReadinessAssessment() {
  const [step, setStep] = useState(0); // 0 = intro, 1-7 = questions, 8 = results
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sendingReport, setSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const navigate = useNavigate();
  usePageView("/readiness-assessment");

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const pct = Math.round((totalScore / MAX_SCORE) * 100);
  const scoreInfo = getScoreLabel(pct);
  const progress = step === 0 ? 0 : step > QUESTIONS.length ? 100 : Math.round((step / QUESTIONS.length) * 100);

  const handleAnswer = (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    const isLastQuestion = step >= QUESTIONS.length;
    setTimeout(() => {
      if (!isLastQuestion) {
        setStep(step + 1);
      } else {
        setStep(QUESTIONS.length + 1);
        // Persist completed assessment
        const finalScore = Object.values(newAnswers).reduce((a, b) => a + b, 0);
        const categories = [...new Set(QUESTIONS.map(q => q.category))];
        const catScores: Record<string, number> = {};
        categories.forEach(cat => {
          const qs = QUESTIONS.filter(q => q.category === cat);
          const catTotal = qs.reduce((s, q) => s + (newAnswers[q.id] || 0), 0);
          catScores[cat] = Math.round((catTotal / (qs.length * 2)) * 100);
        });
        supabase.from("assessment_results" as any).insert({
          assessment_type: "readiness",
          score: finalScore,
          max_score: MAX_SCORE,
          answers: newAnswers,
          category_scores: catScores,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        }).then(() => {});
      }
    }, 300);
  };

  const handleSendReport = async () => {
    if (!email || !email.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setSendingReport(true);
    try {
      await supabase.functions.invoke("generate-risk-report", {
        body: {
          email,
          company_name: companyName,
          answers,
          score: pct,
          assessment_type: "readiness",
        },
      });
      // Update the most recent assessment result with the email
      const categories = [...new Set(QUESTIONS.map(q => q.category))];
      const catScores: Record<string, number> = {};
      categories.forEach(cat => {
        const qs = QUESTIONS.filter(q => q.category === cat);
        const catTotal = qs.reduce((s, q) => s + (answers[q.id] || 0), 0);
        catScores[cat] = Math.round((catTotal / (qs.length * 2)) * 100);
      });
      await supabase.from("assessment_results" as any).insert({
        email,
        company_name: companyName || null,
        assessment_type: "readiness",
        score: totalScore,
        max_score: MAX_SCORE,
        answers,
        category_scores: catScores,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      });
      setReportSent(true);
      toast({ title: "Report sent!", description: "Check your inbox for your personalized governance readiness report." });
    } catch {
      toast({ title: "Failed to send report", description: "Please try again.", variant: "destructive" });
    } finally {
      setSendingReport(false);
    }
  };

  const categories = [
    { name: "AI Risk Classification", questions: QUESTIONS.filter((q) => q.category === "AI Risk Classification") },
    { name: "Audit & Logging", questions: QUESTIONS.filter((q) => q.category === "Audit & Logging") },
    { name: "Human Oversight", questions: QUESTIONS.filter((q) => q.category === "Human Oversight") },
    { name: "Risk Management", questions: QUESTIONS.filter((q) => q.category === "Risk Management") },
    { name: "Data Governance", questions: QUESTIONS.filter((q) => q.category === "Data Governance") },
    { name: "Transparency", questions: QUESTIONS.filter((q) => q.category === "Transparency") },
    { name: "Incident Response", questions: QUESTIONS.filter((q) => q.category === "Incident Response") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground tracking-tight">HFAI</span>
          </Link>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/pilot")}>
            Start Free Pilot
          </Button>
        </div>
      </nav>

      {/* Progress bar */}
      {step > 0 && step <= QUESTIONS.length && (
        <div className="fixed top-14 left-0 right-0 z-40">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>
      )}

      <main className="flex-1 pt-20 pb-16 px-4">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            {/* ── INTRO ── */}
            {step === 0 && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Free Assessment — No Account Required
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                  AI Governance<br />Readiness Score
                </h1>

                <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
                  7 questions. 2 minutes. Find out where you stand before
                  the <span className="text-primary font-medium">August 2026 EU AI Act deadline</span>.
                </p>

                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                  {[
                    { icon: FileCheck, label: "Audit Readiness" },
                    { icon: Eye, label: "Oversight Gaps" },
                    { icon: Scale, label: "Risk Level" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50">
                      <item.icon className="h-5 w-5 text-primary" />
                      <span className="text-[11px] text-muted-foreground font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-sm px-8"
                  onClick={() => setStep(1)}
                >
                  Start Assessment <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-xs text-muted-foreground">
                  Based on EU AI Act Articles 9-15, 53, and 62
                </p>
              </motion.div>
            )}

            {/* ── QUESTIONS ── */}
            {step >= 1 && step <= QUESTIONS.length && (
              <motion.div
                key={`q-${step}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {(() => {
                  const q = QUESTIONS[step - 1];
                  const CategoryIcon = q.categoryIcon;
                  return (
                    <>
                      <button
                        onClick={() => setStep(step - 1)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back
                      </button>

                      <div className="flex items-center gap-2 text-xs text-primary font-medium">
                        <CategoryIcon className="h-4 w-4" />
                        {q.category}
                        <span className="text-muted-foreground ml-auto">
                          {step} of {QUESTIONS.length}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-semibold text-foreground leading-snug">
                        {q.question}
                      </h2>

                      <p className="text-sm text-muted-foreground leading-relaxed">{q.subtext}</p>

                      <div className="space-y-3 pt-2">
                        {q.options.map((opt) => {
                          const isSelected = answers[q.id] === opt.value;
                          return (
                            <button
                              key={opt.label}
                              onClick={() => handleAnswer(q.id, opt.value)}
                              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                                isSelected
                                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                  : "border-border hover:border-primary/40 hover:bg-secondary/30"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                    isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                                  }`}
                                >
                                  {isSelected && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                                  {opt.detail && (
                                    <p className="text-xs text-muted-foreground mt-1">{opt.detail}</p>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}

            {/* ── RESULTS ── */}
            {step > QUESTIONS.length && (() => {
              const exposure = calculateFineExposure(answers);
              const gaps = getCriticalGaps(answers);
              const shareText = `My company's EU AI Act exposure: ${formatEuro(exposure)}. Compliance score: ${pct}/100. Found ${gaps.length} critical gaps. Check yours free: https://hfa-i.org/readiness-assessment`;
              const handleShare = (platform: "copy" | "twitter" | "linkedin") => {
                if (platform === "copy") {
                  navigator.clipboard.writeText(shareText);
                  toast({ title: "Copied to clipboard", description: "Paste it anywhere to share your results." });
                } else if (platform === "twitter") {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
                } else if (platform === "linkedin") {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://hfa-i.org/readiness-assessment")}`, "_blank");
                }
              };

              return (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* ── SCARY FINE NUMBER (the headline) ── */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Card className="border border-destructive/30 bg-gradient-to-br from-destructive/10 via-background to-background overflow-hidden relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--destructive)/5%,_transparent_70%)] pointer-events-none" />
                    <CardContent className="p-8 text-center space-y-4 relative">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/15 border border-destructive/30">
                        <Gavel className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-[11px] font-semibold tracking-wider text-destructive uppercase">
                          Estimated EU AI Act Exposure
                        </span>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-5xl sm:text-6xl font-bold text-destructive tracking-tight"
                      >
                        {formatEuro(exposure)}
                      </motion.div>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                        Maximum fine exposure based on your gaps under{" "}
                        <span className="text-foreground font-medium">EU AI Act Article 99</span>.
                        Penalties up to €35M or 7% of global turnover.
                      </p>
                      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-2">
                        <Clock className="h-3 w-3" />
                        <span>Enforcement begins August 2026</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* ── COMPLIANCE SCORE ── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className={`border border-border/40 ${scoreInfo.bg}`}>
                    <CardContent className="p-6 flex items-center gap-5">
                      <div className="relative flex-shrink-0">
                        <svg className="w-20 h-20 -rotate-90">
                          <circle cx="40" cy="40" r="32" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
                          <motion.circle
                            cx="40" cy="40" r="32"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            className={scoreInfo.color}
                            initial={{ strokeDasharray: `0 ${2 * Math.PI * 32}` }}
                            animate={{ strokeDasharray: `${(pct / 100) * 2 * Math.PI * 32} ${2 * Math.PI * 32}` }}
                            transition={{ delay: 0.7, duration: 1.2, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xl font-bold ${scoreInfo.color}`}>{pct}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <scoreInfo.icon className={`h-4 w-4 ${scoreInfo.color}`} />
                          <span className={`text-sm font-semibold ${scoreInfo.color}`}>{scoreInfo.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {pct >= 80
                            ? "Strong governance foundations. Optimize remaining gaps to reach audit-ready."
                            : pct >= 50
                            ? "Significant gaps could trigger regulatory action before the August 2026 deadline."
                            : "Critical gaps detected. Your AI systems would not survive a regulator review today."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* ── CRITICAL GAPS (with article numbers) ── */}
                {gaps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                        Top {gaps.length} {gaps.length === 1 ? "Gap" : "Gaps"} to Close
                      </h3>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">By severity</span>
                    </div>
                    {gaps.map((gap, i) => {
                      const severityColor =
                        gap.severity === "critical" ? "border-destructive/40 bg-destructive/5"
                        : gap.severity === "high" ? "border-amber-500/40 bg-amber-500/5"
                        : "border-yellow-500/30 bg-yellow-500/5";
                      const badgeColor =
                        gap.severity === "critical" ? "bg-destructive/20 text-destructive border-destructive/30"
                        : gap.severity === "high" ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
                      return (
                        <motion.div
                          key={gap.article}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + i * 0.1 }}
                          className={`rounded-xl border p-4 ${severityColor}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badgeColor} uppercase tracking-wider`}>
                                {gap.severity}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  EU AI ACT · {gap.article}
                                </span>
                              </div>
                              <h4 className="text-sm font-semibold text-foreground leading-snug">
                                {gap.title}
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {gap.detail}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* ── SHARE BUTTONS ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="rounded-xl border border-border/40 bg-secondary/20 p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Share2 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Send these results to your CTO</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5 flex-1 min-w-[100px]" onClick={() => handleShare("copy")}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5 flex-1 min-w-[100px]" onClick={() => handleShare("twitter")}>
                      <Twitter className="h-3.5 w-3.5" /> Tweet
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5 flex-1 min-w-[100px]" onClick={() => handleShare("linkedin")}>
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </Button>
                  </div>
                </motion.div>

                {/* ── PRIMARY CTA: Start fixing ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 text-center space-y-4"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Close these gaps in 2 minutes
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto">
                      Wrap your AI in 3 lines of code. Audit trail, oversight, and incident logging — live in 60 seconds.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-sm px-8"
                    onClick={() => navigate("/pilot")}
                  >
                    Start Free 30-Day Pilot <ArrowRight className="h-4 w-4" />
                  </Button>
                  <p className="text-[10px] text-muted-foreground">
                    No credit card · Cancel anytime · Then $10/mo
                  </p>
                </motion.div>

                {/* ── EMAIL CAPTURE (reframed: lock in results) ── */}
                {!reportSent ? (
                  <Card className="border border-border/40 bg-secondary/20">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold">Lock in this assessment</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Get a PDF with your full article-by-article breakdown and remediation plan.
                      </p>
                      <div className="space-y-2">
                        <Input
                          placeholder="Company name (optional)"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="text-sm h-9"
                        />
                        <Input
                          type="email"
                          placeholder="Work email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="text-sm h-9"
                        />
                        <Button
                          variant="outline"
                          className="w-full gap-2 text-sm h-9"
                          onClick={handleSendReport}
                          disabled={sendingReport}
                        >
                          {sendingReport ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                          ) : (
                            <><Mail className="h-4 w-4" /> Email Me the PDF</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border border-green-500/20 bg-green-500/5">
                    <CardContent className="p-4 text-center space-y-1.5">
                      <CheckCircle className="h-6 w-6 text-green-400 mx-auto" />
                      <h3 className="text-sm font-semibold text-foreground">Report Sent</h3>
                      <p className="text-xs text-muted-foreground">Check your inbox.</p>
                    </CardContent>
                  </Card>
                )}

                {/* ── Category breakdown (collapsed at the bottom now) ── */}
                <details className="rounded-xl border border-border/30 bg-secondary/10">
                  <summary className="px-4 py-3 cursor-pointer text-xs font-semibold text-foreground hover:text-primary transition-colors">
                    Show full breakdown by category
                  </summary>
                  <div className="px-4 pb-4 space-y-2">
                    {categories.map((cat) => {
                      const catPct = getCategoryScore(answers, cat.questions);
                      const catInfo = getScoreLabel(catPct);
                      return (
                        <div key={cat.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-foreground">{cat.name}</span>
                              <span className={`text-xs font-bold ${catInfo.color}`}>{catPct}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  catPct >= 80 ? "bg-green-500" : catPct >= 50 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${catPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </details>

                <div className="text-center pt-2">
                  <button
                    onClick={() => { setStep(0); setAnswers({}); setReportSent(false); setEmail(""); setCompanyName(""); }}
                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                  >
                    Retake Assessment
                  </button>
                </div>
              </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 HFAI Governance Hub · <Link to="/governance" className="hover:text-primary">EU AI Act Framework</Link>
        </p>
      </footer>
    </div>
  );
}
