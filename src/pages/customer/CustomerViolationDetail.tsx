import { useParams, Link } from "react-router-dom";
import { ContentCard } from "@/components/ContentCard";
import { ViolationDetailCard } from "@/components/ViolationDetailCard";
import { RuleCard } from "@/components/RuleCard";
import { AIEventViewer } from "@/components/AIEventViewer";
import { ConversationViewer } from "@/components/ConversationViewer";
import { Timeline } from "@/components/Timeline";
import { SectionHeader } from "@/components/SectionHeader";
import { mockViolationDetail } from "@/lib/mock-data";
import { ArrowLeft, MessageSquare, ScrollText } from "lucide-react";

export default function CustomerViolationDetail() {
  const { id } = useParams();
  const v = mockViolationDetail;
  const userMessage = v.conversation.find((m) => m.role === "user")?.content || "";
  const aiResponse = v.conversation.find((m) => m.role === "assistant")?.content || "";

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/customer/violations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Violations
        </Link>
        <SectionHeader title={`Violation ${v.id}`} description="Review violation details" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-section items-start">
        <div className="lg:col-span-2 space-y-base">
          <ViolationDetailCard id={v.id} description={v.description} severity={v.severity} rule_id={v.rule_id} detected_at={v.detected_at} status={v.status} />
        </div>
        <div className="lg:col-span-3 space-y-base">
          <RuleCard id={v.rule.id} name={v.rule.name} description={v.rule.description} category={v.rule.category} severity_default={v.rule.severity_default} violations_count={18} />
          <AIEventViewer model={v.ai_event.model} user_message={userMessage} ai_response={aiResponse} prompt_tokens={v.ai_event.prompt_tokens} completion_tokens={v.ai_event.completion_tokens} latency_ms={v.ai_event.latency_ms} confidence_score={v.ai_event.confidence_score} context={v.ai_event.context} />
          <ContentCard icon={MessageSquare} title="Conversation">
            <ConversationViewer messages={v.conversation} />
          </ContentCard>
          <ContentCard icon={ScrollText} title="Audit Log Timeline">
            <Timeline events={v.audit_logs} />
          </ContentCard>
        </div>
      </div>
    </div>
  );
}
