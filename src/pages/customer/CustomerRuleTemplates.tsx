import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck } from "lucide-react";

const templates = [
  { name: "No Harmful Content", description: "Detects and flags AI responses containing harmful, violent, or dangerous content.", severity: "critical" },
  { name: "No Hallucinations", description: "Identifies AI responses that contain fabricated facts or unsupported claims.", severity: "high" },
  { name: "No Personal Data Leakage", description: "Flags AI responses that expose personal identifiable information (PII).", severity: "critical" },
  { name: "No Profanity", description: "Detects profane, vulgar, or offensive language in AI outputs.", severity: "medium" },
  { name: "No Jailbreak Attempts", description: "Identifies prompt injection or jailbreak attempts in user messages.", severity: "high" },
];

export default function CustomerRuleTemplates() {
  const handleEnable = (name: string) => {
    // No backend route for rule templates yet
    toast({ title: "Not available", description: "Rule template activation is not yet supported by the backend.", variant: "destructive" });
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
              <Button size="sm" onClick={() => handleEnable(t.name)}>Enable Rule</Button>
            </div>
          </ContentCard>
        ))}
      </div>
    </div>
  );
}
