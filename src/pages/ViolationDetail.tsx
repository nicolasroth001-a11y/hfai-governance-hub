import { useParams, Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { ContentCard } from "@/components/ContentCard";
import { ConversationViewer } from "@/components/ConversationViewer";
import { Timeline } from "@/components/Timeline";
import { ReviewActions } from "@/components/ReviewActions";
import { mockViolationDetail } from "@/lib/mock-data";
import { ArrowLeft, Cpu, MessageSquare, ScrollText, Shield } from "lucide-react";

export default function ViolationDetail() {
  const { id } = useParams();
  const v = mockViolationDetail;

  return (
    <div className="space-y-6">
      <Link to="/violations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Violations
      </Link>

      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{v.id}</h1>
        <SeverityBadge severity={v.severity} />
        <StatusBadge status={v.status} />
      </div>

      <p className="text-muted-foreground">{v.description}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard icon={Shield} title="Rule Details">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-card-foreground/60">Rule ID</span>
              <Link to={`/rules/${v.rule.id}`} className="text-primary hover:underline">{v.rule.id}</Link>
            </div>
            <div className="flex justify-between">
              <span className="text-card-foreground/60">Name</span>
              <span className="text-card-foreground">{v.rule.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-card-foreground/60">Category</span>
              <span className="text-card-foreground">{v.rule.category}</span>
            </div>
            <Separator className="bg-card-foreground/10" />
            <p className="text-card-foreground/80">{v.rule.description}</p>
          </div>
        </ContentCard>

        <ContentCard icon={Cpu} title="AI Event">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-card-foreground/60">Model</span>
              <span className="text-card-foreground font-mono text-xs">{v.ai_event.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-card-foreground/60">Tokens</span>
              <span className="text-card-foreground">{v.ai_event.prompt_tokens} → {v.ai_event.completion_tokens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-card-foreground/60">Latency</span>
              <span className="text-card-foreground">{v.ai_event.latency_ms}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-card-foreground/60">Confidence</span>
              <span className="text-card-foreground">{(v.ai_event.confidence_score * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-card-foreground/60">Context</span>
              <span className="text-card-foreground">{v.ai_event.context}</span>
            </div>
          </div>
        </ContentCard>

        <ContentCard icon={MessageSquare} title="Conversation" fullWidth>
          <ConversationViewer messages={v.conversation} />
        </ContentCard>

        <ContentCard icon={ScrollText} title="Audit Trail">
          <Timeline events={v.audit_logs} />
        </ContentCard>

        <ContentCard title="Review Actions">
          <ReviewActions violationId={v.id} />
        </ContentCard>
      </div>
    </div>
  );
}
