import { useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Play, Save, FileText, Sparkles, User, Building2, Bot, Shield, Calendar, Download, Mail, Copy } from "lucide-react";
import { DEFAULT_DEMO_CONFIG, loadDemoConfig, saveDemoConfig, SCENARIO_LIBRARY, type DemoConfig, type DemoScenario } from "@/lib/demoConfig";
import { generateDemoScriptPDF } from "@/lib/demoScriptPdf";
import { buildRecapEmail } from "@/lib/demoRecapEmail";

export default function AdminDemoMode() {
  const [config, setConfig] = useState<DemoConfig>(() => loadDemoConfig());

  const update = <K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const toggleScenario = (s: DemoScenario) => {
    setConfig((prev) => {
      const has = prev.scenarios.includes(s);
      const scenarios = has ? prev.scenarios.filter((x) => x !== s) : [...prev.scenarios, s];
      return { ...prev, scenarios: scenarios.length ? scenarios : prev.scenarios };
    });
  };

  const handleSave = () => {
    saveDemoConfig(config);
    toast({ title: "Demo config saved", description: "Ready for presenter mode." });
  };

  const handleLaunch = () => {
    saveDemoConfig(config);
    window.open("/admin/demo-mode/present", "_blank", "noopener");
  };

  const handleReset = () => {
    setConfig(DEFAULT_DEMO_CONFIG);
    toast({ title: "Reset to defaults" });
  };

  const handleDownloadPdf = () => {
    saveDemoConfig(config);
    generateDemoScriptPDF(config);
    toast({ title: "Script PDF downloaded", description: "Print or keep on a 2nd screen during the call." });
  };

  const handleOpenRecapEmail = () => {
    saveDemoConfig(config);
    const email = buildRecapEmail(config);
    window.location.href = email.mailtoUrl;
    toast({ title: "Recap email opened", description: `Drafted to ${email.to} — review, then send.` });
  };

  const handleCopyRecapEmail = async () => {
    const email = buildRecapEmail(config);
    await navigator.clipboard.writeText(`To: ${email.to}\nSubject: ${email.subject}\n\n${email.body}`);
    toast({ title: "Recap email copied", description: "Paste into your mail client of choice." });
  };

  return (
    <div className="space-y-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SectionHeader
          title="Demo Cockpit"
          description="Pre-fill prospect data, pick scenarios, then launch the live walkthrough in presenter mode."
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleReset}>Reset</Button>
          <Button variant="outline" onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Save
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf} className="gap-2">
            <Download className="h-4 w-4" /> Script PDF
          </Button>
          <Button variant="outline" onClick={handleCopyRecapEmail} className="gap-2">
            <Copy className="h-4 w-4" /> Copy recap email
          </Button>
          <Button variant="outline" onClick={handleOpenRecapEmail} className="gap-2">
            <Mail className="h-4 w-4" /> Open recap in mail
          </Button>
          <Button onClick={handleLaunch} className="gap-2 bg-primary hover:bg-primary/90">
            <Play className="h-4 w-4" /> Launch Presenter Mode
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard icon={User} title="Prospect">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={config.prospectName} onChange={(e) => update("prospectName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role / Title</Label>
              <Input value={config.prospectRole} onChange={(e) => update("prospectRole", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Company</Label>
              <Input value={config.prospectCompany} onChange={(e) => update("prospectCompany", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={config.prospectEmail} onChange={(e) => update("prospectEmail", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input value={config.industry} onChange={(e) => update("industry", e.target.value)} />
            </div>
          </div>
        </ContentCard>

        <ContentCard icon={Bot} title="AI System Being Demoed">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>System name</Label>
              <Input value={config.aiSystemName} onChange={(e) => update("aiSystemName", e.target.value)} placeholder="e.g. PatientCare GPT Assistant" />
            </div>
            <div className="space-y-2">
              <Label>Provider / Model</Label>
              <Input value={config.aiProvider} onChange={(e) => update("aiProvider", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Reviewer (in scene 6)</Label>
              <Input value={config.reviewerName} onChange={(e) => update("reviewerName", e.target.value)} />
            </div>
          </div>
        </ContentCard>

        <ContentCard icon={Calendar} title="Call Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Call date</Label>
              <Input type="date" value={config.callDate} onChange={(e) => update("callDate", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Presenter</Label>
              <Input value={config.presenterName} onChange={(e) => update("presenterName", e.target.value)} />
            </div>
          </div>
        </ContentCard>

        <ContentCard icon={Shield} title="Primary Scenario (the 'wow' moment)">
          <div className="space-y-3">
            <Select value={config.primaryScenario} onValueChange={(v: DemoScenario) => update("primaryScenario", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(SCENARIO_LIBRARY).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This scenario plays in scene 5 (Violation Detected). The other scenarios remain available as a clickable library Scott can pick from live.
            </p>
          </div>
        </ContentCard>
      </div>

      <ContentCard icon={Sparkles} title="Scenario Library">
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(SCENARIO_LIBRARY).map(([key, s]) => {
            const active = config.scenarios.includes(key as DemoScenario);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleScenario(key as DemoScenario)}
                className={`text-left rounded-lg border p-4 transition-all ${
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/40 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={s.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">{s.severity}</Badge>
                  <span className="text-[10px] font-mono text-muted-foreground">{s.latency}ms</span>
                </div>
                <p className="text-sm font-semibold mb-1">{s.label}</p>
                <p className="text-xs text-muted-foreground mb-2">{s.category}</p>
                <p className="text-xs text-muted-foreground/70 line-clamp-2 italic">"{s.prompt}"</p>
              </button>
            );
          })}
        </div>
      </ContentCard>

      <ContentCard icon={FileText} title="Talking Points & Tips">
        <div className="space-y-4 text-sm text-card-foreground/80 leading-relaxed">
          <div>
            <p className="font-semibold text-card-foreground mb-1">Open with empathy, not pitch</p>
            <p>Scott is a Healthcare CISO. He'll see through generic decks. First 60 seconds: thank him for the LinkedIn nudge, anchor on Community Medical Centers' clinical AI surface area (ambient scribes, CDS, patient chatbots, radiology AI), and ask which one keeps him up at night.</p>
          </div>
          <div>
            <p className="font-semibold text-card-foreground mb-1">Three angles, woven together</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="font-medium">HIPAA + CMIA exposure</span> — Real-time PHI block in 12ms before it touches the chart (Scene 5)</li>
              <li><span className="font-medium">CISO audit posture</span> — Tamper-evident SHA-256 hash chain, OCR-defensible (Scene 6); shadow AI discovery for unsanctioned tools</li>
              <li><span className="font-medium">Medical staff committee</span> — HITL workflows that map cleanly to existing peer-review and credentialing structures (Closing)</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-card-foreground mb-1">If asked about HIPAA BAA</p>
            <p>"We can sign a BAA — Lovable Cloud (our infra layer) is SOC 2 Type II and supports BAA execution. The architecture is designed to never persist PHI in clear text; everything in the audit trail is hash-chained metadata."</p>
          </div>
          <div>
            <p className="font-semibold text-card-foreground mb-1">If asked about pricing</p>
            <p>$10/mo Starter with a 30-day free trial (cancel anytime). Pro ($49.99/mo) for advanced analytics + HITL workflows; Enterprise/Sovereign for healthcare client deployments.</p>
          </div>
          <div className="pt-2 flex gap-2">
            <Button variant="outline" asChild className="gap-2">
              <Link to="/admin/demo-mode/present" target="_blank"><Play className="h-4 w-4" /> Open Presenter Mode</Link>
            </Button>
          </div>
        </div>
      </ContentCard>
    </div>
  );
}
