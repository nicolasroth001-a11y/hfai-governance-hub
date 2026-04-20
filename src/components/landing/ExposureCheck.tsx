import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, ArrowRight, Calendar, XCircle, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const QUESTIONS = [
  {
    question: "Do your AI systems make decisions that affect people?",
    subtext: "Hiring, lending, medical triage, content moderation, risk scoring…",
    yesRisk: "Under the EU AI Act, this likely classifies as high-risk AI.",
  },
  {
    question: "Can you produce a complete audit trail of every AI decision in the last 30 days?",
    subtext: "Article 12 requires logging. Article 14 requires human oversight evidence.",
    noRisk: "Without audit trails, you cannot demonstrate compliance to regulators.",
  },
  {
    question: "Does a human review AI outputs before they reach end users?",
    subtext: "Human-in-the-loop oversight is mandatory for high-risk AI under Article 14.",
    noRisk: "No human oversight = automatic non-compliance for high-risk systems.",
  },
];

type Answer = "yes" | "no" | null;

export function ExposureCheck() {
  const [answers, setAnswers] = useState<Answer[]>([null, null, null]);
  const [currentQ, setCurrentQ] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [email, setEmail] = useState("");
  const [sendingReport, setSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = (answer: Answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = answer;
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 400);
    } else {
      setTimeout(() => setShowResult(true), 400);
    }
  };

  const riskScore = (() => {
    let score = 0;
    if (answers[0] === "yes") score++;
    if (answers[1] === "no") score++;
    if (answers[2] === "no") score++;
    return score;
  })();

  const reset = () => {
    setAnswers([null, null, null]);
    setCurrentQ(0);
    setShowResult(false);
    setEmail("");
    setReportSent(false);
  };

  const handleSendReport = async () => {
    if (!email || !email.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setSendingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-risk-report", {
        body: { email, answers },
      });
      if (error) throw error;
      setReportSent(true);
      toast({ title: "Report sent!", description: "Check your inbox for your personalized compliance report." });
    } catch (e) {
      console.error("Risk report error:", e);
      toast({ title: "Failed to generate report", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-border/40 bg-secondary/20 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Compliance Exposure Check</span>
          </div>
          <div className="flex gap-1">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  answers[i] !== null
                    ? answers[i] === "yes" && i === 0
                      ? "bg-warning"
                      : answers[i] === "no" && i > 0
                      ? "bg-destructive"
                      : "bg-success"
                    : i === currentQ
                    ? "bg-primary/40"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[220px] flex items-center">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full space-y-5"
              >
                <div>
                  <p className="text-base font-semibold text-foreground leading-snug">
                    {QUESTIONS[currentQ].question}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {QUESTIONS[currentQ].subtext}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 text-sm gap-2"
                    onClick={() => handleAnswer("yes")}
                  >
                    <CheckCircle className="h-4 w-4 text-success" /> Yes
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-11 text-sm gap-2"
                    onClick={() => handleAnswer("no")}
                  >
                    <XCircle className="h-4 w-4 text-destructive" /> No
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full text-center space-y-4"
              >
                <ResultHeader riskScore={riskScore} />
                
                {/* AI Report CTA */}
                {!reportSent ? (
                  <div className="bg-secondary/30 rounded-xl p-4 text-left space-y-3">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Get your free AI-personalized risk report
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Our AI will analyze your specific gaps and email you a detailed compliance action plan with article references.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 h-9 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleSendReport()}
                      />
                      <Button
                        size="sm"
                        className="gap-1.5 h-9"
                        onClick={handleSendReport}
                        disabled={sendingReport}
                      >
                        {sendingReport ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
                        ) : (
                          <>Send Report <ArrowRight className="h-3.5 w-3.5" /></>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-success/10 rounded-xl p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-success mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Report sent to {email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Check your inbox for your personalized compliance analysis.</p>
                  </div>
                )}

                <ResultActions riskScore={riskScore} navigate={navigate} reset={reset} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ResultHeader({ riskScore }: { riskScore: number }) {
  if (riskScore >= 2) {
    return (
      <>
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">
            You have {riskScore} compliance gap{riskScore > 1 ? "s" : ""}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Under the EU AI Act (effective Aug 2026), these gaps could result in fines up to <span className="text-destructive font-semibold">€35M or 7% of global revenue</span>.
          </p>
        </div>
      </>
    );
  }
  if (riskScore === 1) {
    return (
      <>
        <div className="h-14 w-14 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-7 w-7 text-warning" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">You're partially exposed</p>
          <p className="text-sm text-muted-foreground mt-1">
            You've got some governance in place, but there's still a gap. HFAI can close it in under 10 minutes.
          </p>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
        <CheckCircle className="h-7 w-7 text-success" />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">You're in good shape</p>
        <p className="text-sm text-muted-foreground mt-1">
          But can you prove it to a regulator? HFAI creates the evidence trail that turns your practices into certified compliance.
        </p>
      </div>
    </>
  );
}

function ResultActions({ riskScore, navigate, reset }: { riskScore: number; navigate: ReturnType<typeof useNavigate>; reset: () => void }) {
  if (riskScore >= 2) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button className="gap-2" onClick={() => window.open("mailto:nicolasroth@hfa-i.org?subject=HFAI%20Demo%20Request&body=Hi%20Nicolas%2C%0A%0AI%27d%20like%20to%20book%20a%20demo%20of%20HFAI.%0A%0AName%3A%0ACompany%3A%0ARole%3A%0APreferred%20time%3A%0A", "_blank", "noopener,noreferrer")}>
          <Calendar className="h-4 w-4" /> Fix This Now <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={reset}>Retake</Button>
      </div>
    );
  }
  if (riskScore === 1) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button className="gap-2" onClick={() => navigate("/signup/customer")}>
          Close the Gap <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={reset}>Retake</Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-center">
      <Button variant="outline" className="gap-2" onClick={() => navigate("/signup/customer")}>
        Certify Your Compliance <ArrowRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={reset}>Retake</Button>
    </div>
  );
}
