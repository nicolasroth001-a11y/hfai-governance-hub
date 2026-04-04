import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [enabling, setEnabling] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<string[]>([]);

  const handleEnable = async (tpl: typeof templates[0]) => {
    setEnabling(tpl.name);
    try {
      await createRule({
        name: tpl.name,
        description: tpl.description,
        severity: tpl.severity,
        category: tpl.category,
        condition: tpl.condition,
        enabled: true,
        org_id: profile?.org_id || undefined,
      });
      setEnabled((prev) => [...prev, tpl.name]);
      toast({ title: t("customerRuleTemplates.ruleEnabled"), description: t("customerRuleTemplates.ruleEnabledDesc", { name: tpl.name }) });
    } catch {
      toast({ title: t("customerRuleTemplates.enableFailed"), variant: "destructive" });
    } finally {
      setEnabling(null);
    }
  };

  return (
    <div className="space-y-section">
      <SectionHeader title={t("customerRuleTemplates.title")} description={t("customerRuleTemplates.description")} />
      <div className="grid gap-4">
        {templates.map((tpl) => (
          <ContentCard key={tpl.name} icon={ShieldCheck} title={tpl.name}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-card-foreground/70">{tpl.description}</p>
                <SeverityBadge severity={tpl.severity} />
              </div>
              <Button
                size="sm"
                disabled={enabling === tpl.name || enabled.includes(tpl.name)}
                onClick={() => handleEnable(tpl)}
              >
                {enabled.includes(tpl.name) ? t("customerRuleTemplates.enabled") : enabling === tpl.name ? t("customerRuleTemplates.enabling") : t("customerRuleTemplates.enableRule")}
              </Button>
            </div>
          </ContentCard>
        ))}
      </div>
    </div>
  );
}
