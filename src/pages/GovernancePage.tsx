import { Link } from "react-router-dom";
import { usePageView } from "@/hooks/usePageView";
import { Shield, CheckCircle, ArrowLeft, Database, Search, Users, GitBranch, AlertTriangle, RotateCcw, CalendarCheck, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    icon: Database,
    title: "Model Inventory",
    description: "We maintain a comprehensive registry of all AI systems in use, including model type, version, provider, risk level, owner team, and deployment status. Every system is tracked from onboarding to retirement.",
  },
  {
    icon: Search,
    title: "Evaluation Methods",
    description: "Each AI system is evaluated against defined safety and compliance rules. Automated detection flags potential violations based on configurable rule conditions, severity thresholds, and behavioral patterns.",
  },
  {
    icon: Eye,
    title: "Data Usage",
    description: "All inputs and outputs processed by AI systems are logged with full metadata. Organizations can audit what data their models consumed and produced, ensuring transparency in data handling.",
  },
  {
    icon: Users,
    title: "Ownership & Accountability",
    description: "Every AI system has a designated owner team. Violations are attributed to specific systems and organizations. Human reviewers are assigned to critical decisions, ensuring clear lines of responsibility.",
  },
  {
    icon: GitBranch,
    title: "Traceability",
    description: "Complete audit trails link every AI event to its source system, any detected violations, human review decisions, and resolution outcomes. Every action in the platform is logged with actor, timestamp, and context.",
  },
  {
    icon: AlertTriangle,
    title: "Failure Handling",
    description: "When violations are detected, a structured workflow guides resolution: open → investigating → resolved. Critical violations trigger immediate human review. Escalation paths ensure nothing falls through the cracks.",
  },
  {
    icon: CalendarCheck,
    title: "Review Cadence",
    description: "Human reviewers regularly evaluate flagged AI decisions. The platform tracks review frequency, average response times, and decision history to ensure consistent governance oversight.",
  },
  {
    icon: RotateCcw,
    title: "User Expectations",
    description: "Organizations using AI-powered products deserve visibility into how decisions are made. HFAI provides the infrastructure to meet regulatory requirements, internal policies, and user trust expectations.",
  },
];

export default function GovernancePage() {
  usePageView("/governance");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-accent/20 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">HFAI</span>
        </Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            AI Governance Framework
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            How we define, measure, and enforce responsible AI — a transparent framework for organizations that take governance seriously.
          </p>
        </section>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <Card key={section.title} className="rounded-[16px]">
              <CardContent className="p-8">
                <div className="flex items-start gap-5">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground/50">{String(i + 1).padStart(2, "0")}</span>
                      <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{section.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Want to implement this framework for your organization?
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/pricing/contact" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              <CheckCircle className="h-4 w-4" /> Get Started
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-accent/20 mt-16 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HFAI — Human‑First AI Governance
      </footer>
    </div>
  );
}
