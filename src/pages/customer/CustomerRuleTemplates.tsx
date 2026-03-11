import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { createRule } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const templates = [
  { name: "No Harmful Content", description: "Detects and flags AI responses containing harmful, violent, or dangerous content.", severity: "critical", category: "safety", condition: "harm,kill,weapon,bomb,attack,destroy" },
  { name: "No Hallucinations", description: "Identifies AI responses that contain fabricated facts or unsupported claims.", severity: "high", category: "accuracy", condition: "fabricated,unsupported,false claim" },
  { name: "No Personal Data Leakage", description: "Flags AI responses that expose personal identifiable information (PII).", severity: "critical", category: "privacy", condition: "ssn,social security,credit card,password,secret" },
  { name: "No Profanity", description: "Detects profane, vulgar, or offensive language in AI outputs.", severity: "medium", category: "content", condition: "profanity,vulgar,offensive,slur" },
  { name: "No Jailbreak Attempts", description: "Identifies prompt injection or jailbreak attempts in user messages.", severity: "high", category: "security", condition: "ignore instructions,bypass,override,pretend you are,act as,jailbreak" },
  { name: "No Hacking Instructions", description: "Flags requests for hacking, exploiting vulnerabilities, or unauthorized system access.", severity: "critical", category: "security", condition: "hack,exploit,vulnerability,brute force,sql injection,phishing,bypass security,crack password" },
  { name: "No Financial Crime Guidance", description: "Detects requests for help with embezzlement, fraud, money laundering, or financial crimes.", severity: "critical", category: "compliance", condition: "embezzle,launder,fraud,steal money,insider trading,tax evasion,ponzi,forge documents" },
  { name: "No Illegal Activity Assistance", description: "Flags requests for help with any illegal activities including theft, forgery, or drug manufacturing.", severity: "critical", category: "safety", condition: "steal,forge,counterfeit,drug,manufacture,smuggle,trafficking,illegal" },
  { name: "No Manipulation Tactics", description: "Detects requests for social engineering, manipulation, or coercion techniques.", severity: "high", category: "ethics", condition: "manipulate,coerce,blackmail,extort,social engineer,impersonate,deceive" },
  { name: "No Weapons or Explosives", description: "Flags requests for building, obtaining, or using weapons or explosive devices.", severity: "critical", category: "safety", condition: "build bomb,make explosive,gun,firearm,weapon,detonate,chemical weapon" },
  { name: "No Harassment Content", description: "Detects content that targets, threatens, or harasses individuals or groups.", severity: "high", category: "ethics", condition: "harass,threaten,stalk,bully,intimidate,dox,doxxing" },
  { name: "No Unauthorized Surveillance", description: "Flags requests for spying, tracking, or surveilling people without consent.", severity: "high", category: "privacy", condition: "spy,track someone,surveillance,monitor without,keylogger,spyware,wiretap" },
];

export default function CustomerRuleTemplates() {
  const { profile } = useAuth();
  const [enabling, setEnabling] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<string[]>([]);

  const handleEnable = async (t: typeof templates[0]) => {
    setEnabling(t.name);
    try {
      await createRule({
        name: t.name,
        description: t.description,
        severity: t.severity,
        category: t.category,
        condition: t.condition,
        enabled: true,
        org_id: profile?.org_id || undefined,
      });
      setEnabled((prev) => [...prev, t.name]);
      toast({ title: "Rule enabled", description: `"${t.name}" is now active.` });
    } catch {
      toast({ title: "Failed to enable rule", variant: "destructive" });
    } finally {
      setEnabling(null);
    }
  };

  return (
    <div className="space-y-section">
      <SectionHeader title="Rule Templates" description="Enable prebuilt governance rules for your AI systems" />
      <div className="grid gap-4">
        {templates.map((t) => (
          <ContentCard key={t.name} icon={ShieldCheck} title={t.name}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-card-foreground/70">{t.description}</p>
                <SeverityBadge severity={t.severity} />
              </div>
              <Button
                size="sm"
                disabled={enabling === t.name || enabled.includes(t.name)}
                onClick={() => handleEnable(t)}
              >
                {enabled.includes(t.name) ? "Enabled ✓" : enabling === t.name ? "Enabling…" : "Enable Rule"}
              </Button>
            </div>
          </ContentCard>
        ))}
      </div>
    </div>
  );
}
