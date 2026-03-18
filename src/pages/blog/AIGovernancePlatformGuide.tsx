import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageView } from "@/hooks/usePageView";

const defined = (s: string) => <strong className="text-foreground">{s}</strong>;

export default function AIGovernancePlatformGuide() {
  usePageView("/blog/ai-governance-platform-complete-guide");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
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
          {/* Breadcrumb */}
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-3 w-3" /> Back to Resources
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60 mb-4">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> March 15, 2026</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 8 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
            AI Governance Platform: The Complete Guide for 2026
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed mb-10">
            As organizations scale their use of AI — from customer-facing chatbots to internal decision-making models — the need for a dedicated {defined("AI governance platform")} has become critical. This guide covers what AI governance platforms do, why every AI-powered organization needs one, and how to choose the right solution.
          </p>

          {/* Content */}
          <div className="prose-custom space-y-10">
            <Section title="What Is an AI Governance Platform?">
              <p>An {defined("AI governance platform")} is software that monitors, evaluates, and enforces policies across all AI systems within an organization. Unlike traditional IT governance tools, it's purpose-built for the unique challenges of AI: non-deterministic outputs, model drift, bias detection, and regulatory compliance.</p>
              <p>Core capabilities include:</p>
              <ul>
                <Li>Real-time monitoring of every AI input and output</Li>
                <Li>Automated policy rule evaluation against AI behavior</Li>
                <Li>Human-in-the-loop review workflows for flagged events</Li>
                <Li>Audit trail generation for compliance documentation</Li>
                <Li>Root cause analysis and remediation tracking</Li>
              </ul>
            </Section>

            <Section title="Why Your Organization Needs AI Governance">
              <p>Without an AI governance platform, organizations face compounding risks:</p>
              <ul>
                <Li><strong className="text-foreground">Regulatory exposure</strong> — The EU AI Act, NIST AI RMF, and ISO 42001 all require documented governance processes. Non-compliance carries fines up to €35M or 7% of global revenue.</Li>
                <Li><strong className="text-foreground">Reputational damage</strong> — A single uncontrolled AI output can make headlines. Governance platforms catch risky behavior before it reaches end users.</Li>
                <Li><strong className="text-foreground">Operational blind spots</strong> — Most teams have no visibility into what their AI systems actually produce. Real-time monitoring eliminates this gap.</Li>
                <Li><strong className="text-foreground">Audit readiness</strong> — When regulators or clients request evidence of AI oversight, you need an immutable audit trail — not a spreadsheet.</Li>
              </ul>
            </Section>

            <Section title="Key Features to Evaluate">
              <p>When comparing AI governance platforms, prioritize these capabilities:</p>
              <Numbered items={[
                { title: "Event Ingestion Speed", desc: "Sub-200ms ingestion ensures your governance layer doesn't bottleneck production AI systems." },
                { title: "Configurable Rules Engine", desc: "Custom rules that evaluate AI behavior against your specific policies — not just generic checks." },
                { title: "Human Review Workflows", desc: "Automated escalation to trained reviewers with context-rich violation summaries." },
                { title: "Root Cause Analysis", desc: "AI-powered diagnosis that identifies why violations occur and suggests preventive rules." },
                { title: "API-First Architecture", desc: "Integration via API means you can add governance to any AI system in minutes, not weeks." },
              ]} />
            </Section>

            <Section title="How HFAI Approaches AI Governance">
              <p>HFAI is a human-first AI governance platform designed for teams that need real-time visibility and control over their AI systems. The platform follows a four-step pipeline:</p>
              <Numbered items={[
                { title: "Ingest", desc: "Your AI systems send structured events via API. Every input, output, and metadata field is captured." },
                { title: "Evaluate", desc: "Events are checked against your rule library in under 200ms. Rules cover content safety, bias, data leakage, and custom policies." },
                { title: "Detect", desc: "Policy violations are flagged instantly with severity classification and contextual evidence." },
                { title: "Review", desc: "Trained human reviewers assess flagged violations, approve or reject, and log decisions for the audit trail." },
              ]} />
              <p>This human-first approach ensures that AI decisions are never left unchecked — every flagged event gets human accountability.</p>
            </Section>

            <Section title="Getting Started">
              <p>You can start monitoring your AI systems in minutes with HFAI's free tier:</p>
              <ul>
                <Li>Connect 1 AI system</Li>
                <Li>5 governance rules</Li>
                <Li>7-day event history</Li>
                <Li>No credit card required</Li>
              </ul>
            </Section>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Start governing your AI today</h2>
          <p className="mt-2 text-sm text-muted-foreground">Free tier available — no credit card required.</p>
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

/* ── Helpers ── */
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

function Numbered({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <ol className="space-y-3 list-none">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span>
            <strong className="text-foreground">{item.title}:</strong> {item.desc}
          </span>
        </li>
      ))}
    </ol>
  );
}
