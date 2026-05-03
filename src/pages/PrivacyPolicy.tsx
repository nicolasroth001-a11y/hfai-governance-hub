import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const lastUpdated = "May 3, 2026";

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Privacy Policy | HFAI Guard & Platform";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">

      <header className="border-b border-border/50">
        <div className="container max-w-4xl py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">HFAI</span>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-12 space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          <p className="text-muted-foreground leading-relaxed">
            This policy applies to the HFAI Guard browser extension, the HFAI website (hfa-i.org),
            the public AI scanner, and the HFAI governance platform (collectively, "HFAI"). HFAI is
            operated by Human-First AI ("we", "us"). We are committed to processing the minimum data
            necessary to deliver AI governance and EU AI Act compliance services.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">1. HFAI Guard Browser Extension</h2>
          <p className="text-muted-foreground leading-relaxed">
            HFAI Guard intercepts prompts you submit to public AI chat interfaces (ChatGPT, Claude,
            Gemini) <strong>locally in your browser</strong> and checks them against an on-device
            ruleset for EU AI Act Article 5 prohibited practices, COPPA, and GDPR risks.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Prompt content is NOT transmitted to HFAI servers</strong> by default. All
              pattern-matching happens client-side.
            </li>
            <li>
              <strong>Local storage only:</strong> Override decisions, blocked-prompt counts, and
              user preferences are stored in <code>chrome.storage.local</code> on your device.
            </li>
            <li>
              <strong>Optional registration:</strong> If you claim your Guard installation by linking
              it to an HFAI account, anonymized violation metadata (rule ID, timestamp, AI provider,
              SHA-256 hash of the prompt — never the prompt itself) is sent to your organization's
              audit log.
            </li>
            <li>
              <strong>Permissions:</strong> <code>storage</code> (local preferences),{" "}
              <code>activeTab</code> (inject the blocking modal), and host permissions limited to{" "}
              chat.openai.com, chatgpt.com, claude.ai, and gemini.google.com.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">2. HFAI Platform (Customer Accounts)</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you create an HFAI account we collect: email, organization name, hashed password,
            MFA secrets (if enabled), and Stripe billing identifiers. AI events you ingest via our
            SDK or proxy are stored encrypted at rest and accessible only to your organization
            under row-level security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">3. Public Scanner & Website</h2>
          <p className="text-muted-foreground leading-relaxed">
            The public AI scanner accepts a URL and returns a compliance assessment. We retain the
            scanned URL and aggregate result for trend analytics. We use Google Analytics 4 with IP
            anonymization. No advertising cookies are set.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">4. How We Use Data</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Provide and secure the HFAI services you request</li>
            <li>Generate audit trails and compliance reports for your organization</li>
            <li>Send transactional email (account, billing, violation alerts)</li>
            <li>Improve detection rules using aggregate, non-identifying telemetry</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            We <strong>do not</strong> sell personal data, train AI models on your prompts, or share
            data with advertisers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">5. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            Audit events: 7 years (EU AI Act Article 19 requirement). Account data: until account
            deletion. Local extension data: until you uninstall the extension or clear browser
            storage. Anonymous scanner results: 24 months.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">6. Your Rights (GDPR / CCPA)</h2>
          <p className="text-muted-foreground leading-relaxed">
            You may request access, correction, export, or deletion of your personal data at any
            time by emailing <a href="mailto:privacy@hfa-i.org" className="text-primary underline">privacy@hfa-i.org</a>.
            We respond within 30 days. EU residents may also lodge a complaint with their national
            data protection authority.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">7. Sub-processors</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Supabase (managed infrastructure & database, EU/US regions)</li>
            <li>Stripe (payment processing)</li>
            <li>Resend / Zoho (transactional email)</li>
            <li>Google Cloud (Gemini API for compliance analysis — only when triggered by you)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">8. Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            TLS 1.2+ in transit, AES-256 at rest, MFA available on all accounts, row-level security
            in the database, and tamper-evident SHA-256 hash chaining on audit records. Report
            vulnerabilities to <a href="mailto:security@hfa-i.org" className="text-primary underline">security@hfa-i.org</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">9. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We will post material changes to this page and update the "Last updated" date. Continued
            use of HFAI after changes constitutes acceptance.
          </p>
        </section>

        <section className="space-y-3 border-t border-border/50 pt-8">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Human-First AI<br />
            Privacy: <a href="mailto:privacy@hfa-i.org" className="text-primary underline">privacy@hfa-i.org</a><br />
            Security: <a href="mailto:security@hfa-i.org" className="text-primary underline">security@hfa-i.org</a><br />
            General: <a href="mailto:nicolasroth@hfa-i.org" className="text-primary underline">nicolasroth@hfa-i.org</a>
          </p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
