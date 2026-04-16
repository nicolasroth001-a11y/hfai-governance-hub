import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Lock, FileCheck, KeyRound, Database, Globe, Server,
  CheckCircle2, Download, ArrowLeft, Cloud, Eye, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePageView } from "@/hooks/usePageView";
import { AwsMarketplaceBadge } from "@/components/landing/AwsMarketplaceBadge";

const inheritedCerts = [
  { name: "SOC 2 Type II", source: "AWS + Supabase infrastructure", status: "Active" },
  { name: "ISO 27001", source: "AWS + Cloudflare", status: "Active" },
  { name: "ISO 27017 / 27018", source: "AWS cloud security", status: "Active" },
  { name: "HIPAA", source: "AWS + Supabase eligible", status: "Active" },
  { name: "PCI DSS Level 1", source: "Stripe (billing)", status: "Active" },
  { name: "GDPR", source: "EU data residency available", status: "Active" },
];

const hfaiCerts = [
  { name: "SOC 2 Type II", status: "In Progress", target: "Q3 2026" },
  { name: "ISO/IEC 27001", status: "Statement of Intent", target: "2027" },
  { name: "CSA STAR Level 1", status: "Self-Assessment Submitted", target: "Listed" },
  { name: "EU AI Act Conformity", status: "Self-Certified", target: "Active" },
];

const controls = [
  { icon: Lock, title: "Encryption Everywhere", desc: "AES-256 at rest, TLS 1.2+ in transit. Keys managed via AWS KMS with automatic rotation." },
  { icon: Shield, title: "Multi-Tenant Isolation", desc: "Row-Level Security (RLS) on every customer table. Cross-org access is database-level impossible." },
  { icon: FileCheck, title: "Tamper-Evident Audit Chain", desc: "Every human review is anchored with a SHA-256 hash chain. Mathematically detectable if altered." },
  { icon: KeyRound, title: "MFA + SSO/SAML", desc: "TOTP MFA on all accounts. Enterprise SSO via SAML 2.0 (Okta, Azure AD, Google Workspace)." },
  { icon: Database, title: "Data Residency", desc: "EU (Frankfurt) and US (Virginia) regions. Sovereign tier supports customer-owned S3 export." },
  { icon: Eye, title: "Continuous Monitoring", desc: "Real-time anomaly detection, dependency scanning (Dependabot + Snyk), and pen-tests on Enterprise+." },
];

const subprocessors = [
  { name: "Amazon Web Services", purpose: "Cloud hosting", region: "EU/US" },
  { name: "Supabase", purpose: "Managed Postgres + Auth", region: "EU/US" },
  { name: "Stripe", purpose: "Billing & payments", region: "Global (PCI)" },
  { name: "Resend", purpose: "Transactional email", region: "EU/US" },
  { name: "Cloudflare", purpose: "Edge / DDoS protection", region: "Global" },
  { name: "Google Cloud (Gemini)", purpose: "AI inference (opt-in)", region: "EU/US" },
];

export default function TrustCenter() {
  usePageView("/trust");

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold tracking-tight">HFAI</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 pt-28 pb-20 space-y-16">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Shield className="h-3 w-3 text-primary" /> Trust Center
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Security & Compliance, <span className="text-primary">by Construction</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            HFAI is the runtime firewall for AI. We&apos;re built on certified infrastructure with controls
            that are mathematically enforced — not policy-promised.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <AwsMarketplaceBadge />
            <a href="/HFAI-Security-Questionnaire-CAIQ-Lite.pdf" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Download CAIQ-Lite Questionnaire
              </Button>
            </a>
          </div>
        </motion.section>

        {/* Inherited certs */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Inherited Certifications</h2>
            <p className="text-sm text-muted-foreground mt-1">
              HFAI runs on infrastructure with the following independently audited certifications.
              These apply transitively to data hosted on the platform.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {inheritedCerts.map((c) => (
              <Card key={c.name} className="border-border/40 bg-secondary/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{c.name}</span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.source}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* HFAI-specific roadmap */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">HFAI Certification Roadmap</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Honest disclosure of where our own attestations stand.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {hfaiCerts.map((c) => (
              <Card key={c.name} className="border-border/40">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.status}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{c.target}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Controls */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Security Controls</h2>
            <p className="text-sm text-muted-foreground mt-1">
              The technical safeguards built into every HFAI deployment.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {controls.map((c) => (
              <Card key={c.title} className="border-border/40 bg-secondary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <c.icon className="h-4 w-4 text-primary" />
                    {c.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Sub-processors */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Sub-Processors</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Full transparency on every third party that may process customer data.
            </p>
          </div>
          <Card className="border-border/40">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-border/40 bg-secondary/10">
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Provider</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Purpose</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Region</th>
                  </tr>
                </thead>
                <tbody>
                  {subprocessors.map((s, i) => (
                    <tr key={s.name} className={i % 2 ? "bg-secondary/5" : ""}>
                      <td className="p-3 text-xs font-medium">{s.name}</td>
                      <td className="p-3 text-xs text-muted-foreground">{s.purpose}</td>
                      <td className="p-3 text-xs text-muted-foreground">{s.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        {/* Procurement / contact */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Procurement & Legal</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Card className="border-border/40 bg-secondary/5">
              <CardContent className="p-4 space-y-1">
                <Server className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">DPA Available</p>
                <p className="text-xs text-muted-foreground">GDPR-compliant Data Processing Agreement on request.</p>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-secondary/5">
              <CardContent className="p-4 space-y-1">
                <Globe className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">SCCs &amp; UK Addendum</p>
                <p className="text-xs text-muted-foreground">Standard Contractual Clauses for international transfers.</p>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-secondary/5">
              <CardContent className="p-4 space-y-1">
                <Cloud className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">AWS Marketplace</p>
                <p className="text-xs text-muted-foreground">Procure via AWS contract — coming Q2 2026.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Incident disclosure */}
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Incident Disclosure</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Customers will be notified of any confirmed security incident affecting their data within 72 hours,
            in line with GDPR Article 33. Report a vulnerability to{" "}
            <a href="mailto:security@hfa-i.org" className="text-primary underline">security@hfa-i.org</a>.
          </p>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground border-t border-border/30 pt-6">
          For custom-scope security review, contact{" "}
          <a href="mailto:security@hfa-i.org" className="text-primary">security@hfa-i.org</a>
          {" · "}Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </footer>
      </main>
    </div>
  );
}
