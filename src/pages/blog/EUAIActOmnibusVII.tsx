import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, ArrowLeft, Calendar, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageView } from "@/hooks/usePageView";

export default function EUAIActOmnibusVII() {
  const navigate = useNavigate();
  usePageView("/blog/eu-ai-act-omnibus-vii-timeline-update");

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
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/blog")}>
              Resources
            </Button>
            <Button size="sm" className="text-xs gap-1" onClick={() => navigate("/signup/customer")}>
              Start Free <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Article */}
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl px-6 pt-28 pb-20"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" onClick={() => navigate("/blog")}>
            <ArrowLeft className="h-3 w-3" /> Blog
          </Button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5">
            Regulatory Update
          </span>
          <span className="text-xs text-muted-foreground">March 2026</span>
          <span className="text-xs text-muted-foreground">· 6 min read</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-4">
          EU AI Act Omnibus VII: What Changed and What It Means for Your AI Governance Timeline
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-10">
          The European Commission's Omnibus VII simplification package reshapes the enforcement calendar for the EU AI Act.
          Here's the updated timeline and what organizations should do now.
        </p>

        {/* Timeline visual */}
        <Card className="border border-primary/20 bg-primary/5 mb-10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Updated Enforcement Timeline</span>
            </div>
            <div className="space-y-4">
              {[
                { date: "Feb 2025", label: "Banned AI practices", status: "active", desc: "Already in force — social scoring, subliminal manipulation, etc." },
                { date: "Aug 2025", label: "AI literacy obligation", status: "active", desc: "Already in force — organizations must ensure AI literacy for staff." },
                { date: "Aug 2026", label: "General-purpose AI (GPAI) rules", status: "upcoming", desc: "Transparency, copyright, systemic risk rules for foundation models." },
                { date: "Dec 2027", label: "High-risk standalone AI", status: "future", desc: "Delayed from Aug 2026. Risk management, human oversight, conformity for standalone high-risk systems." },
                { date: "Aug 2028", label: "High-risk product-embedded AI", status: "future", desc: "AI embedded in regulated products (medical devices, vehicles, etc.) under existing EU product law." },
              ].map((item) => (
                <div key={item.date} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full shrink-0 mt-1 ${
                      item.status === "active" ? "bg-emerald-500" :
                      item.status === "upcoming" ? "bg-amber-500" : "bg-muted-foreground/40"
                    }`} />
                    <div className="w-px flex-1 bg-border/40" />
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono font-semibold text-foreground">{item.date}</span>
                      {item.status === "active" && (
                        <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-bold">In Force</span>
                      )}
                      {item.status === "upcoming" && (
                        <span className="text-[9px] uppercase tracking-wider text-amber-500 font-bold">Next</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item.label}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Section title="What Is Omnibus VII?">
          <p className="text-sm text-muted-foreground leading-relaxed">
            In March 2026, the European Commission adopted the <strong className="text-foreground">Omnibus VII simplification package</strong> — a sweeping
            regulatory update that modifies several pieces of EU legislation, including the EU AI Act (Regulation 2024/1689).
            The package is part of the Commission's broader effort to reduce regulatory burden on European businesses while
            maintaining safety and fundamental rights protections.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            The most significant change for AI governance teams: <strong className="text-foreground">the high-risk AI obligations have been delayed</strong>.
            Standalone high-risk systems now have until <strong className="text-foreground">December 2027</strong>, and product-embedded high-risk AI
            until <strong className="text-foreground">August 2028</strong>. The original August 2026 date now applies only to general-purpose AI model rules.
          </p>
        </Section>

        <Section title="What Still Applies in August 2026">
          <Card className="border border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold text-foreground">Don't let the delay create a false sense of security</span>
              </div>
              <ul className="space-y-2">
                <Li>General-purpose AI (GPAI) transparency and copyright obligations</Li>
                <Li>Systemic risk rules for large foundation models (GPAI with systemic risk)</Li>
                <Li>Banned AI practices are already in force since February 2025</Li>
                <Li>AI literacy requirements have applied since August 2025</Li>
              </ul>
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            If your organization uses or deploys foundation models (GPT, Claude, Gemini, Llama, etc.), the August 2026
            deadline is still very real. You need transparency documentation, copyright compliance processes, and — for
            models with systemic risk — red-teaming, incident reporting, and cybersecurity measures.
          </p>
        </Section>

        <Section title="What's Delayed — and Why It Matters">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The high-risk obligations under <strong className="text-foreground">Articles 6–15, 26–27, and Annex III</strong> — which cover risk management systems,
            data governance, technical documentation, human oversight, accuracy and robustness, and conformity assessments — are
            now pushed to December 2027 for standalone systems and August 2028 for AI embedded in regulated products.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            This delay gives organizations additional time, but it does <strong className="text-foreground">not</strong> reduce the scope of obligations.
            The requirements remain identical — only the enforcement date has moved. Organizations that wait until late 2027
            to begin compliance programs risk being unprepared.
          </p>
        </Section>

        <Section title="US Regulatory Landscape: NIST AI RMF + State Laws">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Meanwhile in the United States, the regulatory landscape continues to evolve in parallel:
          </p>
          <ul className="space-y-2 mt-3">
            <Li><strong className="text-foreground">Colorado AI Act amendments (March 2026)</strong> — Updated developer obligations and consumer notification requirements for high-risk AI decisions</Li>
            <Li><strong className="text-foreground">NIST AI RMF</strong> remains the de facto US governance standard, referenced by the FTC, SEC, and CFPB in enforcement guidance</Li>
            <Li><strong className="text-foreground">US Department of Commerce</strong> has updated federal AI use-case reporting deadlines</Li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            For organizations operating in both jurisdictions, a dual-framework governance approach (EU AI Act + NIST AI RMF)
            is no longer optional — it's the minimum standard.
          </p>
        </Section>

        <Section title="What You Should Do Now">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Clock, title: "Don't delay governance", desc: "The high-risk deadline moved, but building compliance programs takes 12–18 months. Start now." },
              { icon: Shield, title: "Implement human oversight", desc: "Articles 14 and 26 require documented human review processes. Build the workflows today." },
              { icon: Calendar, title: "Track both frameworks", desc: "EU AI Act + NIST AI RMF coverage ensures you're prepared regardless of jurisdiction." },
              { icon: AlertTriangle, title: "Monitor GPAI obligations", desc: "If you use foundation models, August 2026 rules still apply — transparency, copyright, systemic risk." },
            ].map((item) => (
              <Card key={item.title} className="border border-border/30">
                <CardContent className="p-4">
                  <item.icon className="h-4 w-4 text-primary mb-2" />
                  <span className="text-sm font-semibold text-foreground block mb-1">{item.title}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="How HFAI Helps">
          <p className="text-sm text-muted-foreground leading-relaxed">
            HFAI's governance platform is designed for exactly this regulatory environment — one where deadlines shift but
            obligations don't disappear. Whether you're preparing for GPAI rules in August 2026 or high-risk obligations in
            December 2027, HFAI provides:
          </p>
          <ul className="space-y-2 mt-3">
            <Li>Real-time AI event monitoring with full input/output capture</Li>
            <Li>Automated rule evaluation engine with configurable severity tiers</Li>
            <Li>Human oversight workflows with approve/reject/escalate decisions</Li>
            <Li>Dual-framework compliance coverage (EU AI Act + NIST AI RMF)</Li>
            <Li>Exportable governance reports for regulatory submission</Li>
            <Li>AI-powered root cause analysis and remediation playbooks</Li>
          </ul>
        </Section>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Start governing before the deadlines hit</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Create a free account — no credit card required. Connect your first AI system in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="gap-2" onClick={() => navigate("/signup/customer")}>
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/pilot")}>
              Request Pilot
            </Button>
          </div>
        </div>
      </motion.article>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-6 mt-auto">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">HFAI</span>
          </div>
          <p className="text-[11px] text-muted-foreground/40">© {new Date().getFullYear()} HFAI</p>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-foreground tracking-tight mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
      <span>{children}</span>
    </li>
  );
}
