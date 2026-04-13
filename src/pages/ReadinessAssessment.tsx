import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle,
  XCircle, Mail, Loader2, Building2, Users, Globe, Cpu,
  FileCheck, Scale, Eye, Lock, BarChart3,
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
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setTimeout(() => {
      if (step < QUESTIONS.length) setStep(step + 1);
      else setStep(QUESTIONS.length + 1);
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
            {step > QUESTIONS.length && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Score card */}
                <Card className={`border-0 ${scoreInfo.bg}`}>
                  <CardContent className="p-8 text-center space-y-4">
                    <scoreInfo.icon className={`h-12 w-12 mx-auto ${scoreInfo.color}`} />
                    <div>
                      <div className={`text-5xl font-bold ${scoreInfo.color}`}>{pct}%</div>
                      <div className={`text-lg font-semibold mt-1 ${scoreInfo.color}`}>{scoreInfo.label}</div>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      {pct >= 80
                        ? "Your organization shows strong governance foundations. A few optimizations could make you fully audit-ready."
                        : pct >= 50
                        ? "You have some governance in place, but significant gaps could expose you to regulatory action before August 2026."
                        : "Critical compliance gaps detected. Without immediate action, your organization faces serious regulatory risk under the EU AI Act."}
                    </p>
                  </CardContent>
                </Card>

                {/* Category breakdown */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Breakdown by Category</h3>
                  {categories.map((cat) => {
                    const catPct = getCategoryScore(answers, cat.questions);
                    const catInfo = getScoreLabel(catPct);
                    return (
                      <div key={cat.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
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

                {/* Email capture */}
                {!reportSent ? (
                  <Card className="border border-primary/20 bg-primary/5">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Mail className="h-5 w-5" />
                        <h3 className="text-sm font-semibold">Get Your Full Readiness Report</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Receive a detailed PDF with specific remediation steps, article-by-article gap analysis,
                        and a prioritized action plan — personalized to your score.
                      </p>
                      <div className="space-y-3">
                        <Input
                          placeholder="Company name (optional)"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          type="email"
                          placeholder="Work email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="text-sm"
                        />
                        <Button
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-sm"
                          onClick={handleSendReport}
                          disabled={sendingReport}
                        >
                          {sendingReport ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                          ) : (
                            <><Mail className="h-4 w-4" /> Send My Report</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border border-green-500/20 bg-green-500/5">
                    <CardContent className="p-6 text-center space-y-2">
                      <CheckCircle className="h-8 w-8 text-green-400 mx-auto" />
                      <h3 className="text-sm font-semibold text-foreground">Report Sent!</h3>
                      <p className="text-xs text-muted-foreground">
                        Check your inbox for your personalized governance readiness report.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* CTA */}
                <div className="text-center space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Want to close these gaps automatically?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-sm"
                      onClick={() => navigate("/pilot")}
                    >
                      Start Free 30-Day Pilot <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => { setStep(0); setAnswers({}); setReportSent(false); setEmail(""); setCompanyName(""); }}>
                      Retake Assessment
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
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
