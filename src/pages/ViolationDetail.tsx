import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { ConversationViewer } from "@/components/ConversationViewer";
import { ReviewActions } from "@/components/ReviewActions";
import { mockViolationDetail } from "@/lib/mock-data";
import { ArrowLeft, Clock, Cpu, MessageSquare, ScrollText, Shield } from "lucide-react";
import { format } from "date-fns";

export default function ViolationDetail() {
  const { id } = useParams();
  const v = mockViolationDetail; // In production, fetch by id

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
        {/* Rule Details */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">Rule Details</h2>
          </div>
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
        </Card>

        {/* AI Event */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">AI Event</h2>
          </div>
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
        </Card>

        {/* Conversation */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">Conversation</h2>
          </div>
          <ConversationViewer messages={v.conversation} />
        </Card>

        {/* Audit Logs */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ScrollText className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">Audit Trail</h2>
          </div>
          <div className="space-y-4">
            {v.audit_logs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-card-foreground">{log.action.replace(/_/g, " ")}</span>
                    <span className="text-xs text-card-foreground/40">by {log.actor}</span>
                  </div>
                  <p className="text-xs text-card-foreground/60 mt-0.5">{log.details}</p>
                  <p className="text-xs text-card-foreground/40 mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Review Actions */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-card-foreground mb-4">Review Actions</h2>
          <ReviewActions violationId={v.id} />
        </Card>
      </div>
    </div>
  );
}
