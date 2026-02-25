import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ContentCard } from "@/components/ContentCard";
import { ViolationDetailCard } from "@/components/ViolationDetailCard";
import { RuleCard } from "@/components/RuleCard";
import { AIEventViewer } from "@/components/AIEventViewer";
import { ConversationViewer } from "@/components/ConversationViewer";
import { Timeline } from "@/components/Timeline";
import { ReviewActions } from "@/components/ReviewActions";
import { ReviewerNotesInput } from "@/components/ReviewerNotesInput";
import { SectionHeader } from "@/components/SectionHeader";
import { mockViolationDetail, mockReviewers } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageSquare, ScrollText, StickyNote, UserCog, Settings } from "lucide-react";

export default function AdminViolationDetail() {
  const { id } = useParams();
  const v = mockViolationDetail;
  const [assignedReviewer, setAssignedReviewer] = useState(v.assigned_reviewer || "");
  const [status, setStatus] = useState(v.status);
  const userMessage = v.conversation.find((m) => m.role === "user")?.content || "";
  const aiResponse = v.conversation.find((m) => m.role === "assistant")?.content || "";

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/admin/violations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Violations
        </Link>
        <SectionHeader title={`Violation ${v.id}`} description="Admin review and management" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-section items-start">
        <div className="lg:col-span-2 space-y-base">
          <ViolationDetailCard id={v.id} description={v.description} severity={v.severity} rule_id={v.rule_id} detected_at={v.detected_at} status={status} />

          <ContentCard icon={Settings} title="Admin Controls">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-card-foreground/60">Assign Reviewer</label>
                <Select value={assignedReviewer} onValueChange={setAssignedReviewer}>
                  <SelectTrigger className="bg-card border-card-foreground/10">
                    <SelectValue placeholder="Select reviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockReviewers.map((r) => (
                      <SelectItem key={r.id} value={r.email}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-card-foreground/60">Change Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-card border-card-foreground/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ContentCard>

          <ContentCard title="Review Actions">
            <ReviewActions violationId={v.id} />
          </ContentCard>
          <ContentCard icon={StickyNote} title="Reviewer Notes">
            <ReviewerNotesInput violationId={v.id} />
          </ContentCard>
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
