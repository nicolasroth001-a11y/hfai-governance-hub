import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Download, Shield, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import jsPDF from "jspdf";

type Applicability = "applicable" | "not_applicable" | "partial";

interface SoAEntry {
  applicability: Applicability;
  justification: string;
}

const SOA_CONTROLS = [
  { id: "A.2.2", clause: "5.2", label: "AI Policy", defaultApplicable: true },
  { id: "A.2.3", clause: "5.3", label: "AI Roles & Responsibilities", defaultApplicable: true },
  { id: "A.2.4", clause: "7.1", label: "Resources for AI", defaultApplicable: true },
  { id: "A.3.2", clause: "5.3", label: "Roles within AIMS", defaultApplicable: true },
  { id: "A.3.3", clause: "5.1", label: "Duties of Top Management", defaultApplicable: true },
  { id: "A.4.3", clause: "8.1", label: "AI System Lifecycle Processes", defaultApplicable: true },
  { id: "A.4.4", clause: "7.1", label: "Tools and Frameworks", defaultApplicable: true },
  { id: "A.4.5", clause: "8.1", label: "Data Management", defaultApplicable: true },
  { id: "A.4.6", clause: "8.1", label: "System & Data Quality", defaultApplicable: true },
  { id: "A.5.2", clause: "6.1", label: "AI Impact Assessment", defaultApplicable: true },
  { id: "A.5.3", clause: "6.1", label: "Documenting Impact Results", defaultApplicable: true },
  { id: "A.5.4", clause: "6.1", label: "Systemic Bias Assessment", defaultApplicable: true },
  { id: "A.6.2.2", clause: "8.1", label: "Design & Development", defaultApplicable: true },
  { id: "A.6.2.3", clause: "8.1", label: "Verification & Validation", defaultApplicable: true },
  { id: "A.6.2.4", clause: "8.1", label: "Deployment & Use", defaultApplicable: true },
  { id: "A.6.2.5", clause: "9.1", label: "Operation & Monitoring", defaultApplicable: true },
  { id: "A.6.2.6", clause: "8.1", label: "Retirement", defaultApplicable: false },
  { id: "A.7.2", clause: "8.1", label: "Data Quality for AI", defaultApplicable: true },
  { id: "A.7.3", clause: "8.1", label: "Data Provenance", defaultApplicable: true },
  { id: "A.7.4", clause: "8.1", label: "Data Preparation", defaultApplicable: true },
  { id: "A.8.2", clause: "7.4", label: "Transparency of AI Systems", defaultApplicable: true },
  { id: "A.8.3", clause: "7.4", label: "Provision of Information", defaultApplicable: true },
  { id: "A.8.4", clause: "7.4", label: "AI System Reporting", defaultApplicable: true },
  { id: "A.9.2", clause: "8.1", label: "Intended Use Documentation", defaultApplicable: true },
  { id: "A.9.3", clause: "8.1", label: "Misuse Prevention", defaultApplicable: true },
  { id: "A.9.4", clause: "8.1", label: "Human Oversight", defaultApplicable: true },
  { id: "A.10.2", clause: "8.1", label: "Supplier Assessment", defaultApplicable: true },
  { id: "A.10.3", clause: "8.1", label: "Third-Party Monitoring", defaultApplicable: true },
];

export default function CustomerStatementOfApplicability() {
  const [entries, setEntries] = useState<Record<string, SoAEntry>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("iso42001_soa") || "{}");
      if (Object.keys(saved).length > 0) return saved;
    } catch {}
    const defaults: Record<string, SoAEntry> = {};
    SOA_CONTROLS.forEach((c) => {
      defaults[c.id] = { applicability: c.defaultApplicable ? "applicable" : "not_applicable", justification: "" };
    });
    return defaults;
  });

  const save = (id: string, entry: SoAEntry) => {
    const next = { ...entries, [id]: entry };
    setEntries(next);
    localStorage.setItem("iso42001_soa", JSON.stringify(next));
  };

  const applicable = SOA_CONTROLS.filter((c) => entries[c.id]?.applicability === "applicable").length;
  const partial = SOA_CONTROLS.filter((c) => entries[c.id]?.applicability === "partial").length;
  const notApplicable = SOA_CONTROLS.filter((c) => entries[c.id]?.applicability === "not_applicable").length;
  const withJustification = SOA_CONTROLS.filter((c) => entries[c.id]?.justification?.trim()).length;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16);
    doc.text("Statement of Applicability — ISO/IEC 42001", 14, y); y += 10;
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y); y += 6;
    doc.text(`Applicable: ${applicable} | Partial: ${partial} | Not Applicable: ${notApplicable}`, 14, y); y += 10;

    // Table header
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Control", 14, y);
    doc.text("Clause", 55, y);
    doc.text("Label", 70, y);
    doc.text("Status", 140, y);
    y += 5;
    doc.setFont("helvetica", "normal");

    SOA_CONTROLS.forEach((ctrl) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const e = entries[ctrl.id];
      doc.text(ctrl.id, 14, y);
      doc.text(ctrl.clause, 55, y);
      doc.text(ctrl.label, 70, y);
      doc.text((e?.applicability || "—").toUpperCase(), 140, y);
      y += 5;
      if (e?.justification) {
        const lines = doc.splitTextToSize(`  ${e.justification}`, 165);
        doc.text(lines, 18, y);
        y += lines.length * 3.5 + 2;
      }
    });

    doc.save("statement-of-applicability-iso42001.pdf");
    toast({ title: "SoA exported as PDF" });
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Statement of Applicability" description="Declare which ISO 42001 Annex A controls apply to your organization and document justifications." />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ContentCard title=""><div className="text-center py-2"><p className="text-2xl font-bold text-emerald-600">{applicable}</p><p className="text-xs text-muted-foreground mt-1">Applicable</p></div></ContentCard>
        <ContentCard title=""><div className="text-center py-2"><p className="text-2xl font-bold text-yellow-600">{partial}</p><p className="text-xs text-muted-foreground mt-1">Partial</p></div></ContentCard>
        <ContentCard title=""><div className="text-center py-2"><p className="text-2xl font-bold text-muted-foreground">{notApplicable}</p><p className="text-xs text-muted-foreground mt-1">Not Applicable</p></div></ContentCard>
        <ContentCard title=""><div className="text-center py-2"><p className="text-2xl font-bold text-primary">{withJustification}</p><p className="text-xs text-muted-foreground mt-1">Justified</p></div></ContentCard>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExportPDF}>
          <Download className="h-4 w-4 mr-1" /> Export PDF
        </Button>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-card-foreground">ISO 42001 Clause 6.1.3 — Statement of Applicability</p>
          <p className="text-muted-foreground mt-1">
            For each Annex A control, declare whether it applies to your AI management system.
            Where a control is excluded, provide justification to satisfy certification auditors.
          </p>
        </div>
      </div>

      {/* Controls table */}
      <div className="space-y-2">
        {SOA_CONTROLS.map((ctrl) => {
          const e = entries[ctrl.id] || { applicability: "applicable" as Applicability, justification: "" };
          const StatusIcon = e.applicability === "applicable" ? CheckCircle2 : e.applicability === "partial" ? MinusCircle : XCircle;
          const statusColor = e.applicability === "applicable" ? "text-emerald-600" : e.applicability === "partial" ? "text-yellow-600" : "text-muted-foreground";

          return (
            <ContentCard key={ctrl.id} title="">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <StatusIcon className={`h-4 w-4 shrink-0 ${statusColor}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{ctrl.id}: {ctrl.label}</p>
                    <p className="text-[10px] text-muted-foreground">Clause {ctrl.clause}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Select value={e.applicability} onValueChange={(v) => save(ctrl.id, { ...e, applicability: v as Applicability })}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applicable">Applicable</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="not_applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {e.applicability !== "applicable" && (
                <Textarea
                  placeholder="Justification for exclusion or partial applicability..."
                  value={e.justification}
                  onChange={(ev) => save(ctrl.id, { ...e, justification: ev.target.value })}
                  className="mt-2 text-xs min-h-[40px]"
                />
              )}
            </ContentCard>
          );
        })}
      </div>
    </div>
  );
}
