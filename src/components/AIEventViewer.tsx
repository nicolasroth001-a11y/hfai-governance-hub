import { ContentCard } from "@/components/ContentCard";
import { Cpu } from "lucide-react";

interface AIEventViewerProps {
  model: string;
  user_message: string;
  ai_response: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  confidence_score: number;
  context: string;
}

export function AIEventViewer({
  model,
  user_message,
  ai_response,
  prompt_tokens,
  completion_tokens,
  latency_ms,
  confidence_score,
  context,
}: AIEventViewerProps) {
  return (
    <ContentCard icon={Cpu} title="AI Event">
      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-card-foreground/60">Model</span>
          <span className="text-card-foreground font-mono text-xs">{model}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-card-foreground/60">Confidence</span>
          <span className="text-card-foreground">{(confidence_score * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-card-foreground/60">Tokens</span>
          <span className="text-card-foreground">{prompt_tokens} → {completion_tokens}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-card-foreground/60">Latency</span>
          <span className="text-card-foreground">{latency_ms}ms</span>
        </div>
      </div>

      <div className="text-xs text-card-foreground/50 mb-4">Context: {context}</div>

      {/* User message / AI response */}
      <div className="space-y-3 pt-3 border-t border-primary/10">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-card-foreground/50 mb-1">User Message</span>
          <div className="rounded-lg bg-card-foreground/5 px-4 py-3 text-sm text-card-foreground leading-relaxed">
            {user_message}
          </div>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-card-foreground/50 mb-1">AI Response</span>
          <div className="rounded-lg bg-primary/8 px-4 py-3 text-sm text-card-foreground leading-relaxed border border-primary/10">
            {ai_response}
          </div>
        </div>
      </div>
    </ContentCard>
  );
}
