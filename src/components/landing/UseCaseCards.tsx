import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Heart, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";

const useCases = [
  {
    icon: Building2,
    industry: "Fintech",
    title: "Lending Decision Oversight",
    scenario: "A mid-size lender uses GPT-4 to pre-screen loan applications. HFAI monitors every decision for bias, PII exposure, and regulatory compliance.",
    results: [
      "47 bias violations caught in first 30 days",
      "Human reviewers override 12% of AI rejections",
      "Full audit trail for CFPB examination readiness",
    ],
    systems: "3 AI systems · 12 governance rules · 2 reviewers",
    framework: "NIST AI RMF + ECOA compliance",
  },
  {
    icon: Heart,
    industry: "Healthtech",
    title: "Clinical Triage AI Monitoring",
    scenario: "A telehealth platform routes patient intake through an AI triage system. HFAI ensures no unsolicited diagnoses or treatment recommendations escape without human sign-off.",
    results: [
      "23 medical advice violations flagged pre-deployment",
      "100% of high-severity outputs routed to clinical review",
      "EU AI Act Art. 14 human oversight documentation ready",
    ],
    systems: "1 AI system · 8 governance rules · 4 reviewers",
    framework: "EU AI Act (high-risk) + MDR alignment",
  },
  {
    icon: Scale,
    industry: "Legaltech",
    title: "Contract Review AI Governance",
    scenario: "A legal AI platform analyzes contracts and flags risk clauses. HFAI monitors for hallucinated legal citations, confidentiality breaches, and accuracy drift.",
    results: [
      "31 hallucinated case citations caught in 60 days",
      "Confidentiality violation rate dropped 89%",
      "Weekly compliance reports auto-generated for partners",
    ],
    systems: "2 AI systems · 15 governance rules · 3 reviewers",
    framework: "NIST AI RMF GOVERN + MEASURE",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export function UseCaseCards() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-4 sm:grid-cols-3">
        {useCases.map((uc, i) => (
          <motion.div
            key={uc.industry}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <Card className="border border-border/40 bg-secondary/10 hover:border-primary/20 transition-all duration-300 h-full group">
              <CardContent className="p-5 flex flex-col gap-3 h-full">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <uc.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold">
                    {uc.industry}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-foreground leading-tight">{uc.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{uc.scenario}</p>

                <div className="mt-auto pt-3 space-y-1.5">
                  {uc.results.map((result) => (
                    <div key={result} className="flex items-start gap-1.5">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                      <span className="text-[11px] text-foreground/80 leading-snug">{result}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border/20 mt-2">
                  <p className="text-[10px] text-muted-foreground font-mono">{uc.systems}</p>
                  <p className="text-[10px] text-primary/70 font-mono mt-0.5">{uc.framework}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-6">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate("/signup/customer")}>
          Build Your Own Governance Setup <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
