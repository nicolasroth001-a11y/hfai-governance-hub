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
  { name: "No Harmful Content", description: "Detects and flags AI responses containing harmful, violent, or dangerous content.", severity: "critical", category: "safety" },
  { name: "No Hallucinations", description: "Identifies AI responses that contain fabricated facts or unsupported claims.", severity: "high", category: "accuracy" },
  { name: "No Personal Data Leakage", description: "Flags AI responses that expose personal identifiable information (PII).", severity: "critical", category: "privacy" },
  { name: "No Profanity", description: "Detects profane, vulgar, or offensive language in AI outputs.", severity: "medium", category: "content" },
  { name: "No Jailbreak Attempts", description: "Identifies prompt injection or jailbreak attempts in user messages.", severity: "high", category: "security" },
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
