import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageView } from "@/hooks/usePageView";

export default function EUAIActComplianceTool() {
  usePageView("/blog/eu-ai-act-compliance-tool");

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
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-3 w-3" /> Back to Resources
          </Link>

          <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60 mb-4">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> March 10, 2026</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 10 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
            EU AI Act Compliance Tool: How to Meet Every Requirement
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed mb-10">
            The EU AI Act is the world's first comprehensive AI regulation, and it takes full effect in 2026. Organizations deploying AI in Europe — or serving European users — need an <strong className="text-foreground">EU AI Act compliance tool</strong> to classify risk, monitor AI systems, and maintain audit-ready documentation.
          </p>

          <div className="prose-custom space-y-10">
            <Section title="EU AI Act: What You Need to Know">
              <p>The EU AI Act creates a risk-based regulatory framework for AI systems. It classifies AI applications into four tiers:</p>
              <Card className="border border-border/40 bg-secondary/20">
                <CardContent className="p-5 space-y-3">
                  <RiskTier level="Unacceptable" color="text-destructive" desc="Banned outright: social scoring, real-time biometric surveillance (with exceptions), manipulative AI." />
                  <RiskTier level="High Risk" color="text-primary" desc="Strict obligations: AI in hiring, credit scoring, law enforcement, critical infrastructure. Requires conformity assessment, monitoring, and human oversight." />
                  <RiskTier level="Limited Risk" color="text-muted-foreground" desc="Transparency obligations: chatbots, deepfakes, and emotion recognition must disclose AI use." />
                  <RiskTier level="Minimal Risk" color="text-muted-foreground/60" desc="No specific obligations: spam filters, AI-powered games, etc." />
                </CardContent>
              </Card>
            </Section>

            <Section title="Key Compliance Requirements for High-Risk AI">
              <p>If your AI system falls into the high-risk category, the EU AI Act mandates:</p>
              <ul>
                <Li><strong className="text-foreground">Risk Management System</strong> — Continuous identification, analysis, and mitigation of risks throughout the AI system lifecycle.</Li>
                <Li><strong className="text-foreground">Data Governance</strong> — Training data must be relevant, representative, and free from bias. Documentation required.</Li>
                <Li><strong className="text-foreground">Technical Documentation</strong> — Detailed records of system design, development, and testing before market placement.</Li>
                <Li><strong className="text-foreground">Record Keeping</strong> — Automatic logging of AI system operations for traceability and audit.</Li>
                <Li><strong className="text-foreground">Transparency</strong> — Clear instructions for downstream users explaining AI capabilities and limitations.</Li>
                <Li><strong className="text-foreground">Human Oversight</strong> — Systems must be designed for effective human oversight, including the ability to override or stop the AI.</Li>
                <Li><strong className="text-foreground">Accuracy & Robustness</strong> — Systems must achieve appropriate levels of accuracy and be resilient to errors and attacks.</Li>
              </ul>
            </Section>

            <Section title="What an EU AI Act Compliance Tool Must Do">
              <p>A proper compliance tool should automate the heavy lifting of EU AI Act adherence:</p>
              <Numbered items={[
                { title: "Risk Classification Engine", desc: "Automatically categorize your AI systems by risk tier based on use case, sector, and data sensitivity." },
                { title: "Continuous Monitoring", desc: "Real-time tracking of every AI input, output, and decision — the 'automatic logging' the Act requires." },
                { title: "Policy Rule Enforcement", desc: "Configurable rules that evaluate AI behavior against Act requirements and your internal policies." },
                { title: "Human Oversight Workflows", desc: "Structured review processes where trained humans assess flagged AI decisions before they take effect." },
                { title: "Audit Trail Generation", desc: "Immutable, exportable records of all AI activity, policy evaluations, and human review decisions." },
                { title: "Incident & Remediation Tracking", desc: "Root cause analysis and corrective action workflows when violations are detected." },
              ]} />
            </Section>

            <Section title="How HFAI Helps You Comply">
              <p>HFAI was built with EU AI Act compliance as a first-class concern. Here's how the platform maps to Act requirements:</p>
              <Card className="border border-border/40 bg-secondary/20">
                <CardContent className="p-5 space-y-2 text-sm">
                  <ComplianceRow requirement="Automatic logging (Art. 12)" feature="Every AI event captured via API with full input/output/metadata" />
                  <ComplianceRow requirement="Human oversight (Art. 14)" feature="Trained reviewer workflows with approve/reject/escalate actions" />
                  <ComplianceRow requirement="Risk management (Art. 9)" feature="Configurable rule engine with severity classification" />
                  <ComplianceRow requirement="Transparency (Art. 13)" feature="Full audit trail with exportable compliance reports" />
                  <ComplianceRow requirement="Accuracy monitoring (Art. 15)" feature="Real-time anomaly detection and pattern analysis" />
                </CardContent>
              </Card>
            </Section>

            <Section title="Timeline: When Do You Need to Comply?">
              <p>The EU AI Act entered into force in August 2024, with obligations phasing in:</p>
              <ul>
                <Li><strong className="text-foreground">February 2025</strong> — Prohibited AI practices banned</Li>
                <Li><strong className="text-foreground">August 2025</strong> — General-purpose AI model obligations</Li>
                <Li><strong className="text-foreground">August 2026</strong> — Full high-risk AI system obligations</Li>
              </ul>
              <p>Organizations deploying high-risk AI systems should have governance tooling in place <strong className="text-foreground">now</strong> — waiting until the deadline means scrambling under pressure.</p>
            </Section>

            <Section title="Getting Started with EU AI Act Compliance">
              <p>Start with HFAI's free tier to map your AI systems and set up foundational governance:</p>
              <ul>
                <Li>Register your first AI system and classify its risk level</Li>
                <Li>Configure rules aligned to EU AI Act articles</Li>
                <Li>Send test events to validate your monitoring pipeline</Li>
                <Li>Review flagged violations with the human review workflow</Li>
              </ul>
            </Section>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Start your EU AI Act compliance journey</h2>
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

function RiskTier({ level, color, desc }: { level: string; color: string; desc: string }) {
  return (
    <div className="flex items-start gap-2">
      <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${color}`} />
      <span className="text-sm text-muted-foreground"><strong className="text-foreground">{level}:</strong> {desc}</span>
    </div>
  );
}

function ComplianceRow({ requirement, feature }: { requirement: string; feature: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1.5 border-b border-border/20 last:border-0">
      <span className="text-foreground font-medium shrink-0 sm:w-48">{requirement}</span>
      <span className="text-muted-foreground">{feature}</span>
    </div>
  );
}
