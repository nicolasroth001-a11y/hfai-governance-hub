import { motion } from "framer-motion";
import { FileText, Shield, Hash, CheckCircle2, Download } from "lucide-react";
import type { DemoConfig } from "@/lib/demoConfig";

export function Scene7bAuditReport({ config }: { config: DemoConfig }) {
  const reportDate = new Date(config.callDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center justify-between px-3 py-2 mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-card-foreground">
              Annex IV Technical Documentation · {config.aiSystemName}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
            <Download className="h-3 w-3" /> 47-page PDF · auto-generated
          </span>
        </div>

        {/* Mock document — multi-section preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-neutral-900 rounded-lg border border-border shadow-inner mx-auto max-w-3xl overflow-hidden"
        >
          {/* Header band */}
          <div className="px-8 pt-7 pb-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#c4993a]" />
                <span className="font-bold text-sm text-neutral-900">HFAI · Compliance Evidence Report</span>
              </div>
              <span className="text-[10px] text-neutral-500">Generated {reportDate}</span>
            </div>
          </div>

          {/* Title block */}
          <div className="px-8 py-5 border-b border-neutral-200 bg-neutral-50">
            <p className="text-[10px] uppercase tracking-widest text-[#c4993a] font-bold mb-1">
              EU AI Act Annex IV — Technical Documentation
            </p>
            <h2 className="text-2xl font-bold mb-1 text-neutral-900">{config.aiSystemName}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-600">
              <span><strong>Deployer:</strong> {config.prospectCompany}</span>
              <span><strong>Risk Tier:</strong> High (Annex III §5 — Healthcare)</span>
              <span><strong>Reporting Period:</strong> Last 30 days</span>
              <span><strong>Report ID:</strong> HFAI-2026-04-CMC-001</span>
            </div>
          </div>

          {/* Sections */}
          <div className="px-8 py-5 space-y-4 text-[11px] leading-relaxed text-neutral-800">
            <section>
              <p className="font-bold text-neutral-900 mb-1 text-[12px]">1. System Description (Art. 11(1)(a))</p>
              <p>
                {config.aiSystemName} is an {config.aiProvider}-based clinical assistant deployed across
                ambient scribe, clinical decision support, and patient-facing chat workflows at {config.prospectCompany}.
                Governed end-to-end by the HFAI runtime enforcement layer with HIPAA, CMIA, EU AI Act, and NIST AI RMF rule packs active.
              </p>
              <p className="mt-1.5"><strong>Intended purpose:</strong> Encounter documentation, decision support recommendations, and patient triage / Q&amp;A.</p>
              <p><strong>Out-of-scope use:</strong> Autonomous diagnosis, persistent storage of PHI in clear text, behavioral / emotional inference on patients.</p>
            </section>

            <section>
              <p className="font-bold text-neutral-900 mb-1 text-[12px]">2. Risk Management System (Art. 9)</p>
              <table className="w-full border border-neutral-300 text-[10px]">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="border border-neutral-300 px-2 py-1 text-left">Risk Category</th>
                    <th className="border border-neutral-300 px-2 py-1 text-center">Active Rules</th>
                    <th className="border border-neutral-300 px-2 py-1 text-center">Detected (30d)</th>
                    <th className="border border-neutral-300 px-2 py-1 text-center">Blocked</th>
                    <th className="border border-neutral-300 px-2 py-1 text-center">Reached User</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-neutral-300 px-2 py-1">PHI leakage / HIPAA §164.502</td><td className="border border-neutral-300 px-2 py-1 text-center">22</td><td className="border border-neutral-300 px-2 py-1 text-center">41</td><td className="border border-neutral-300 px-2 py-1 text-center text-[#0a7a3f] font-bold">41</td><td className="border border-neutral-300 px-2 py-1 text-center">0</td></tr>
                  <tr><td className="border border-neutral-300 px-2 py-1">EU AI Act Art. 5 Prohibited</td><td className="border border-neutral-300 px-2 py-1 text-center">9</td><td className="border border-neutral-300 px-2 py-1 text-center">2</td><td className="border border-neutral-300 px-2 py-1 text-center text-[#0a7a3f] font-bold">2</td><td className="border border-neutral-300 px-2 py-1 text-center">0</td></tr>
                  <tr><td className="border border-neutral-300 px-2 py-1">Clinical hallucination / unverified citation</td><td className="border border-neutral-300 px-2 py-1 text-center">14</td><td className="border border-neutral-300 px-2 py-1 text-center">19</td><td className="border border-neutral-300 px-2 py-1 text-center text-[#0a7a3f] font-bold">17</td><td className="border border-neutral-300 px-2 py-1 text-center">2*</td></tr>
                  <tr><td className="border border-neutral-300 px-2 py-1">Diagnosis without physician sign-off</td><td className="border border-neutral-300 px-2 py-1 text-center">8</td><td className="border border-neutral-300 px-2 py-1 text-center">6</td><td className="border border-neutral-300 px-2 py-1 text-center text-[#0a7a3f] font-bold">6</td><td className="border border-neutral-300 px-2 py-1 text-center">0</td></tr>
                  <tr><td className="border border-neutral-300 px-2 py-1">Self-harm / crisis escalation</td><td className="border border-neutral-300 px-2 py-1 text-center">7</td><td className="border border-neutral-300 px-2 py-1 text-center">3</td><td className="border border-neutral-300 px-2 py-1 text-center text-[#0a7a3f] font-bold">3</td><td className="border border-neutral-300 px-2 py-1 text-center">0</td></tr>
                </tbody>
              </table>
              <p className="text-[9px] text-neutral-500 mt-1">* 2 unverified citations reached clinician with mandatory disclosure label; flagged for human review within SLA.</p>
            </section>

            <section>
              <p className="font-bold text-neutral-900 mb-1 text-[12px]">3. Data Governance (Art. 10)</p>
              <p>
                Foundation model not retrained by deployer. Inference data subject to runtime governance:
                PHI never persisted in clear text; only hash-chained metadata is retained;
                row-level security isolates {config.prospectCompany} from all other organizations.
              </p>
              <ul className="mt-1.5 ml-4 list-disc space-y-0.5">
                <li>PHI detection: name + DOB + MRN / identifier &gt; threshold → block + redact in 12ms</li>
                <li>Retention: 30 days hot, 7 years cold (hash-only, HIPAA §164.530(j) aligned), then purge</li>
                <li>Geographic boundary: us-west-2 (BAA-covered region)</li>

            <section>
              <p className="font-bold text-neutral-900 mb-1 text-[12px]">4. Human Oversight Evidence (Art. 14)</p>
              <p>
                {config.reviewerName} serves as designated reviewer. <strong>156 of 156 (100%)</strong>{' '}
                violations reviewed within SLA (median 4.2 minutes). Override rate: 2.6% (4 of 156).
                SHA-256 hash chain integrity: <span className="font-mono text-[#0a7a3f] font-bold">VERIFIED</span>.
              </p>
              <div className="mt-1.5 p-2 bg-neutral-50 border border-neutral-200 rounded font-mono text-[9px] text-neutral-700">
                Latest block #1250 · prev: a3f2e1b4c8d7…f9a2 · curr: <span className="text-[#c4993a]">d8e2f9a4c1b7…3e5f</span> · ts: {reportDate}
              </div>
            </section>

            <section>
              <p className="font-bold text-neutral-900 mb-1 text-[12px]">5. Accuracy, Robustness & Cybersecurity (Art. 15)</p>
              <p>
                P99 enforcement latency: <strong>11ms</strong>. Uptime (30d): <strong>99.97%</strong>.
                Adversarial prompt robustness tested against OWASP LLM Top-10; no successful jailbreaks logged.
                Detection precision (audited sample n=200): <strong>97.5%</strong>; recall: <strong>94.0%</strong>.
              </p>
            </section>

            <section>
              <p className="font-bold text-neutral-900 mb-1 text-[12px]">6. NIST AI RMF Alignment</p>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {[
                  { fn: "GOVERN", score: "92%" },
                  { fn: "MAP", score: "88%" },
                  { fn: "MEASURE", score: "84%" },
                  { fn: "MANAGE", score: "81%" },
                ].map((f) => (
                  <div key={f.fn} className="border border-neutral-300 p-2 text-center rounded">
                    <p className="text-[9px] text-neutral-500 uppercase tracking-wider">{f.fn}</p>
                    <p className="text-base font-bold text-[#c4993a]">{f.score}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* KPI strip */}
            <div className="mt-2 grid grid-cols-4 gap-2 pt-3 border-t border-neutral-200">
              <div className="rounded border border-neutral-200 p-2 text-center">
                <p className="text-base font-bold text-[#c4993a]">84%</p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-500">Compliance score</p>
              </div>
              <div className="rounded border border-neutral-200 p-2 text-center">
                <p className="text-base font-bold text-[#c4993a]">12,847</p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-500">Events governed</p>
              </div>
              <div className="rounded border border-neutral-200 p-2 text-center">
                <p className="text-base font-bold text-[#c4993a]">156</p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-500">Violations blocked</p>
              </div>
              <div className="rounded border border-neutral-200 p-2 text-center">
                <p className="text-base font-bold text-[#c4993a]">100%</p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-500">Chain integrity</p>
              </div>
            </div>

            <p className="text-[9px] text-neutral-400 text-center pt-2">— Page 1 of 47 · Annex IV §11 documentation continues —</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid gap-3 sm:grid-cols-3"
      >
        {[
          { icon: FileText, title: "Annex IV PDF", sub: "EU AI Act compliant, on-demand" },
          { icon: Hash, title: "Hash-chain receipt", sub: "Tamper-evident, regulator-grade" },
          { icon: CheckCircle2, title: "GRC export", sub: "Pushes to OneTrust / Drata / Vanta" },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="rounded-lg border border-border bg-card p-4">
              <Icon className="h-4 w-4 text-primary mb-2" />
              <p className="text-xs font-semibold text-card-foreground">{c.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
