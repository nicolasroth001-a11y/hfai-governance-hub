import { useEffect, useState } from "react";
import { Card as ShadcnCard } from "@/components/ui/card";
import { fetchAISystem } from "@/lib/api";
import { Cpu, Server, Tag, Shield, Info } from "lucide-react";

interface AISystemInfoCardProps {
  aiSystemId: string | number;
}

export function AISystemInfoCard({ aiSystemId }: AISystemInfoCardProps) {
  const [system, setSystem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (aiSystemId) {
      fetchAISystem(String(aiSystemId))
        .then(setSystem)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [aiSystemId]);

  const fields = system
    ? [
        { icon: Cpu, label: "System Name", value: system.name },
        { icon: Tag, label: "System ID", value: system.id, mono: true },
        { icon: Server, label: "Model Type", value: system.model_type || "—" },
        { icon: Info, label: "Provider", value: system.provider || "—" },
        { icon: Tag, label: "Version", value: system.version || "—" },
        { icon: Shield, label: "Risk Level", value: system.risk_level || "—" },
      ]
    : [];

  return (
    <ShadcnCard className="p-card overflow-hidden">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-card-foreground/6">
        <Cpu className="h-4 w-4 text-primary/80" />
        <h2 className="text-section text-card-foreground">AI System Information</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 rounded bg-card-foreground/5 animate-pulse" style={{ width: `${70 - i * 10}%` }} />
          ))}
        </div>
      ) : error ? (
        <p className="text-xs text-destructive/80">Failed to load: {error}</p>
      ) : !system ? (
        <p className="text-xs text-card-foreground/40">No AI system linked (ID: {String(aiSystemId)})</p>
      ) : (
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center gap-2.5 text-xs text-card-foreground/60">
              <f.icon className="h-3.5 w-3.5 text-primary/60 shrink-0" />
              <span>{f.label}: <span className={`text-card-foreground font-medium ${f.mono ? "font-mono" : ""}`}>{f.value}</span></span>
            </div>
          ))}
          {system.description && (
            <p className="text-xs text-card-foreground/50 pt-2 border-t border-card-foreground/6 leading-relaxed">
              {system.description}
            </p>
          )}
        </div>
      )}
    </ShadcnCard>
  );
}
