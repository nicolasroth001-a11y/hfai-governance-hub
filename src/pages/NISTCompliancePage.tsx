import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, ArrowRight, CheckCircle, Layers, Search, BarChart3, Settings, FileText, Users, Activity, AlertTriangle, GitBranch, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePageView } from "@/hooks/usePageView";

const nistFunctions = [
  {
    id: "govern",
    label: "GOVERN",
    icon: Layers,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "Establish and maintain organizational AI risk management policies, processes, and accountability structures.",
    mappings: [
      { feature: "Human-First Framework", desc: "Binding governance doctrine with 8 sections covering AI oversight laws, rights, and enforcement", icon: Shield },
      { feature: "Role-Based Access Control", desc: "Three-tier architecture (Admin, Reviewer, Customer) with strict data isolation and accountability", icon: Users },
      { feature: "Audit Trail", desc: "Every platform action logged with actor, timestamp, entity type, and full context", icon: GitBranch },
      { feature: "Enforcement Ladder", desc: "4-level escalation: Corrective Notice → Formal Warning → Restricted AI Use → Full Human-Only Mode", icon: AlertTriangle },
    ],
  },
  {
    id: "map",
    label: "MAP",
    icon: Search,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Identify and categorize AI risks based on context, intended use, and potential impacts.",
    mappings: [
      { feature: "AI System Registry", desc: "Comprehensive inventory tracking model type, provider, version, risk level, owner team, and deployment status", icon: FileText },
      { feature: "EU Risk Tier Classification", desc: "Built-in risk categorization from Minimal to Unacceptable, aligned with both EU AI Act and NIST risk levels", icon: Layers },
      { feature: "Data Governance Notes", desc: "Per-system documentation of data handling practices, training data sources, and governance policies", icon: Eye },
      { feature: "Transparency URI", desc: "Link AI systems to their public transparency documentation and model cards", icon: Activity },
    ],
  },
  {
    id: "measure",
    label: "MEASURE",
    icon: BarChart3,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Assess, analyze, and monitor AI risks using quantitative and qualitative methods.",
    mappings: [
      { feature: "Real-Time Event Monitoring", desc: "Every AI input/output captured via Proxy or REST API with <200ms rule evaluation", icon: Activity },
      { feature: "Configurable Rule Engine", desc: "Custom rules with severity classification, category tagging, and automated condition evaluation", icon: Settings },
      { feature: "Violation Pattern Detection", desc: "Systemic pattern analysis identifies recurring issues across AI systems and time periods", icon: BarChart3 },
      { feature: "Compliance Reports", desc: "Exportable reports mapping your AI governance posture to regulatory requirements", icon: FileText },
    ],
  },
  {
    id: "manage",
    label: "MANAGE",
    icon: Settings,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    description: "Prioritize, respond to, and manage AI risks with appropriate actions and resources.",
    mappings: [
      { feature: "Human Oversight Reviews", desc: "Trained reviewers approve, reject, or escalate flagged AI decisions with full audit context", icon: Users },
      { feature: "Root Cause Analysis", desc: "AI-powered diagnosis identifies why violations occur and generates remediation playbooks", icon: Search },
      { feature: "Remediation Actions", desc: "Structured action items with assignees, due dates, status tracking, and completion verification", icon: CheckCircle },
      { feature: "Notification System", desc: "Automated alerts for new violations, high-severity events, and detected patterns via email", icon: AlertTriangle },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function NISTCompliancePage() {
  usePageView("/nist-ai-rmf");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
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
              <Link to="/pilot">Free Pilot <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl text-center">
          <Button variant="ghost" size="sm" className="gap-1 mb-6 text-xs" asChild>
            <Link to="/governance"><ArrowLeft className="h-3 w-3" /> Governance Framework</Link>
          </Button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <span className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold">US Standard</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight">
            NIST AI Risk Management<br />Framework Alignment
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The NIST AI RMF is the de facto US national standard for AI governance. Federal agencies including
            the FTC, SEC, and CFPB reference it in enforcement actions. Here's how HFAI maps to every function.
          </p>
        </motion.div>
      </section>

      {/* 4 Functions */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl space-y-12">
          {nistFunctions.map((fn, fi) => (
            <motion.div
              key={fn.id}
              custom={fi}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-xl ${fn.bgColor} flex items-center justify-center`}>
                  <fn.icon className={`h-5 w-5 ${fn.color}`} />
                </div>
                <div>
                  <Badge variant="outline" className="text-[10px] font-mono mb-0.5">{fn.label}</Badge>
                  <p className="text-sm text-muted-foreground">{fn.description}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {fn.mappings.map((mapping, mi) => (
                  <motion.div key={mapping.feature} custom={mi + 1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                    <Card className="border border-border/30 bg-secondary/5 h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`h-8 w-8 rounded-lg ${fn.bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                            <mapping.icon className={`h-4 w-4 ${fn.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{mapping.feature}</span>
                              <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">{mapping.desc}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Summary Stats */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">16 of 16 NIST AI RMF Controls Mapped</h2>
              <p className="text-sm text-muted-foreground mb-6">
                HFAI provides native coverage across all four NIST AI RMF functions — Govern, Map, Measure, and Manage.
              </p>
              <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-8">
                {nistFunctions.map((fn) => (
                  <div key={fn.id} className="text-center">
                    <div className={`h-12 w-12 rounded-xl ${fn.bgColor} flex items-center justify-center mx-auto mb-2`}>
                      <fn.icon className={`h-5 w-5 ${fn.color}`} />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{fn.label}</span>
                    <p className="text-[10px] text-muted-foreground">{fn.mappings.length} controls</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/pilot">Start Free 14-Day Pilot <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <Link to="/governance">View Governance Framework</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dual Compliance */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Dual Compliance: US + EU</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-8">
            HFAI is the only platform that natively maps to both the NIST AI RMF and the EU AI Act — one platform, two regulatory frameworks.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Card className="border border-border/30">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">🇺🇸</div>
                <h3 className="text-sm font-bold text-foreground mb-1">NIST AI RMF</h3>
                <p className="text-xs text-muted-foreground">Govern · Map · Measure · Manage</p>
                <Badge variant="outline" className="mt-3 text-[10px]">16 controls mapped</Badge>
              </CardContent>
            </Card>
            <Card className="border border-border/30">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">🇪🇺</div>
                <h3 className="text-sm font-bold text-foreground mb-1">EU AI Act</h3>
                <p className="text-xs text-muted-foreground">Art. 9 · 12 · 13 · 14 · 15 · 61</p>
                <Badge variant="outline" className="mt-3 text-[10px]">6 articles covered</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/30 py-8 px-6 text-center">
        <p className="text-[11px] text-muted-foreground/40">© {new Date().getFullYear()} HFAI — All rights reserved</p>
      </footer>
    </div>
  );
}
