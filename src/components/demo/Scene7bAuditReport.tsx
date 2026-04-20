import { motion } from "framer-motion";
import { FileText, Shield, Hash, CheckCircle2 } from "lucide-react";
import type { DemoConfig } from "@/lib/demoConfig";

export function Scene7bAuditReport({ config }: { config: DemoConfig }) {
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
          <span className="text-[10px] text-muted-foreground">Auto-generated PDF preview · 47 pages</span>
        </div>

        {/* Mock document page */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-neutral-900 rounded-lg border border-border p-8 shadow-inner aspect-[8.5/11] max-h-[560px] overflow-hidden mx-auto max-w-2xl"
        >
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#c4993a]" />
              <span className="font-bold text-sm">HFAI · Compliance Evidence Report</span>
            </div>
            <span className="text-[10px] text-neutral-500">Generated {config.callDate}</span>
          </div>

          <p className="text-[10px] uppercase tracking-widest text-[#c4993a] font-bold mb-1">
            EU AI Act Annex IV — Technical Documentation
          </p>
          <h2 className="text-xl font-bold mb-1">{config.aiSystemName}</h2>
          <p className="text-xs text-neutral-600 mb-5">
            {config.prospectCompany} · Risk Tier: High · Period: Last 30 days
          </p>

          <div className="space-y-3 text-[11px] leading-relaxed">
            <section>
              <p className="font-bold text-neutral-800 mb-1">1. System Description</p>
              <p className="text-neutral-700">
                {config.aiSystemName} is an {config.aiProvider}-based assistant deployed for patient-facing
                interactions. Governed by HFAI runtime enforcement layer with HIPAA + EU AI Act rule packs.
              </p>
            </section>

            <section>
              <p className="font-bold text-neutral-800 mb-1">2. Risk Management (Art. 9)</p>
              <p className="text-neutral-700">
                47 active rules · 12 healthcare-specific. 23 violations detected and blocked in reporting period.
                0 violations reached end-users.
              </p>
            </section>

            <section>
              <p className="font-bold text-neutral-800 mb-1">3. Data Governance (Art. 10)</p>
              <p className="text-neutral-700">
                PHI never persisted in clear text. Hash-chained metadata only. RLS-isolated per tenant.
              </p>
            </section>

            <section>
              <p className="font-bold text-neutral-800 mb-1">4. Human Oversight Evidence (Art. 14)</p>
              <p className="text-neutral-700">
                21 of 23 violations reviewed within SLA. SHA-256 hash chain integrity: <span className="font-mono">VERIFIED</span>.
                Latest block: #1250 · <span className="font-mono">d8e2f9a4c1b7…3e5f</span>
              </p>
            </section>

            <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-neutral-200">
              <div className="rounded border border-neutral-200 p-2 text-center">
                <p className="text-base font-bold text-[#c4993a]">84%</p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-500">Compliance score</p>
              </div>
              <div className="rounded border border-neutral-200 p-2 text-center">
                <p className="text-base font-bold text-[#c4993a]">12,847</p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-500">Events governed</p>
              </div>
              <div className="rounded border border-neutral-200 p-2 text-center">
                <p className="text-base font-bold text-[#c4993a]">100%</p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-500">Chain integrity</p>
              </div>
            </div>
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
