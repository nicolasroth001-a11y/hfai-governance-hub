import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageView } from "@/hooks/usePageView";

export default function HumanOversightAISystems() {
  usePageView("/blog/human-oversight-ai-systems");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground tracking-tight">HFAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link to="/blog">Resources</Link>
            </Button>
            <Button size="sm" className="text-xs gap-1" asChild>
              <Link to="/signup/customer">Get Started <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      <article className="pt-28 pb-20 px-6 mx-auto max-w-3xl w-full">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-3 w-3" /> Back to Resources
          </Link>

          <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60 mb-4">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> March 5, 2026</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 6 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
            Why Human Oversight Is Non‑Negotiable for AI Systems
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed mb-10">
            AI systems are making decisions at unprecedented scale — from approving loans to diagnosing patients. But without <strong className="text-foreground">human oversight</strong>, these decisions can go wrong in ways that are hard to detect and harder to reverse.
          </p>

          <div className="prose-custom space-y-10">
            <Section title="The Case for Human-in-the-Loop AI">
              <p>Even the best AI models produce errors. They hallucinate facts, amplify biases in training data, and make confidently wrong decisions. Human oversight isn't about distrusting AI — it's about building a safety net that catches the inevitable failures.</p>
              <p>Three forces are converging to make human oversight mandatory:</p>
              <ul>
                <Li><strong className="text-foreground">Regulation</strong> — The EU AI Act (Article 14) explicitly requires human oversight for high-risk AI systems, including the ability to override or shut down AI decisions.</Li>
                <Li><strong className="text-foreground">Liability</strong> — When AI causes harm, organizations are liable. Human review creates documented accountability.</Li>
                <Li><strong className="text-foreground">Trust</strong> — Customers and stakeholders trust AI systems more when they know humans are involved in critical decisions.</Li>
              </ul>
            </Section>

            <Section title="What Effective Human Oversight Looks Like">
              <p>Human oversight doesn't mean manually reviewing every AI output. It means building intelligent escalation systems that surface the right decisions to the right people:</p>
              <ul>
                <Li><strong className="text-foreground">Rule-based flagging</strong> — Define policies that automatically escalate AI outputs matching risk patterns.</Li>
                <Li><strong className="text-foreground">Severity classification</strong> — Not all flags are equal. Critical violations get immediate human attention; low-severity flags are batched for periodic review.</Li>
                <Li><strong className="text-foreground">Contextual review</strong> — Reviewers see the full context: AI input, output, matched rule, severity, and historical patterns.</Li>
                <Li><strong className="text-foreground">Decision logging</strong> — Every human decision (approve, reject, escalate) is recorded in an immutable audit trail.</Li>
              </ul>
            </Section>

            <Section title="The Cost of Skipping Oversight">
              <p>Organizations that deploy AI without human oversight face real consequences:</p>
              <ul>
                <Li>A hiring AI that systematically discriminates goes undetected for months</Li>
                <Li>A customer-facing chatbot shares confidential information with no one noticing</Li>
                <Li>A credit scoring model denies applications based on proxy variables for protected characteristics</Li>
              </ul>
              <p>Each of these scenarios has happened. Each was preventable with proper governance tooling.</p>
            </Section>

            <Section title="How HFAI Enables Human Oversight at Scale">
              <p>HFAI's human-first approach means every AI decision can be monitored, evaluated, and reviewed without slowing down your AI systems:</p>
              <ul>
                <Li>Events are ingested and evaluated in under 200ms — no production impact</Li>
                <Li>Violations are automatically assigned to trained reviewers with full context</Li>
                <Li>Reviewers can approve, reject, or escalate with structured decision templates</Li>
                <Li>Root cause analysis identifies systemic issues and prevents recurrence</Li>
                <Li>The complete audit trail satisfies EU AI Act Article 14 requirements</Li>
              </ul>
            </Section>
          </div>
        </motion.div>

        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Put humans back in control of AI</h2>
          <p className="mt-2 text-sm text-muted-foreground">Start with HFAI's free tier — no credit card required.</p>
          <Button size="lg" className="mt-6 gap-2" asChild>
            <Link to="/signup/customer">Get Started Free <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </article>

      <footer className="border-t border-border/30 py-8 px-6 text-center">
        <p className="text-[11px] text-muted-foreground/40">© {new Date().getFullYear()} HFAI — All rights reserved</p>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
