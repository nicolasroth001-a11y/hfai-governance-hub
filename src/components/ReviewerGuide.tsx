import { ContentCard } from "@/components/ContentCard";
import { Shield, ShieldCheck, BookOpen, Wrench, UserPlus, Settings, LogIn, LayoutDashboard, AlertTriangle, FileText, Scale, CheckCircle, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function ReviewerGuide() {
  return (
    <div className="space-y-6">
      {/* How to Add a Reviewer - Step by Step */}
      <ContentCard icon={BookOpen} title="How to Add a Reviewer">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Follow these steps to add an in-house reviewer to your organization. Only customer admins can create reviewer accounts.
          </p>

          <div className="space-y-4">
            {[
              {
                step: 1,
                icon: UserPlus,
                title: "Click \"Add In-House Reviewer\"",
                description: "Use the button above to open the creation form. Enter your reviewer's full name, company email, and a temporary password (minimum 8 characters).",
              },
              {
                step: 2,
                icon: LogIn,
                title: "Share credentials securely",
                description: "Send the email and temporary password to your reviewer through a secure channel (e.g. encrypted message, in person). They'll use the main Sign In page — the same one you use.",
              },
              {
                step: 3,
                icon: LayoutDashboard,
                title: "Reviewer signs in",
                description: "When your reviewer signs in, they're automatically routed to the Reviewer Dashboard — a dedicated view scoped entirely to your organization's data. They never see your admin settings or billing.",
              },
              {
                step: 4,
                icon: Settings,
                title: "Configure permissions",
                description: "Back on this page, toggle the permissions for each reviewer. You control whether they can manage rules, manage AI systems, or approve deployments. Violation review is always enabled.",
              },
            ].map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 flex items-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{step}</span>
                  </div>
                </div>
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary/70" />
                    <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Want expert support?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click "Request HFAI Expert" to add a dedicated compliance specialist from HFAI to your team. They can help your in-house reviewer navigate complex violations, flag critical risks, and block dangerous outputs before they reach production. Included with the Sovereign tier or available as a paid add-on.
            </p>
          </div>
        </div>
      </ContentCard>

      {/* Reviewer Role & Tools */}
      <ContentCard icon={Wrench} title="In-House Reviewer: Role & Tools">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Your in-house reviewer is your organization's frontline for AI governance. Here's what they see and what they can do.
          </p>

          <div className="rounded-lg border border-border/50 bg-background/40 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">What they see</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Reviewers access a dedicated dashboard scoped to your organization. They see the same governance data you do — violations, rules, AI events, AI systems — but they <strong>cannot</strong> access billing, subscription settings, or create additional accounts.
            </p>
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="violations" className="border-border/30">
              <AccordionTrigger className="text-sm py-3 hover:no-underline">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive/70" />
                  Violation Review & Decisions
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-2 pb-4">
                <p>The core function of every reviewer. When a governance rule is triggered, the reviewer:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Sees the full violation context — what rule was broken, severity, AI system involved, and the event payload</li>
                  <li>Reads the AI-generated root cause analysis (RCA) with suggested remediation</li>
                  <li>Submits a decision: <strong>Approve</strong>, <strong>Reject</strong>, <strong>Escalate</strong>, or <strong>Request More Info</strong></li>
                  <li>Adds reviewer notes that become part of the tamper-evident audit trail</li>
                </ul>
                <p>Every review is cryptographically hashed into a chain for regulatory audit evidence.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rules" className="border-border/30">
              <AccordionTrigger className="text-sm py-3 hover:no-underline">
                <span className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary/70" />
                  Rule Management
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-2 pb-4">
                <p>When the <strong>Manage Rules</strong> permission is enabled, reviewers can:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Create new governance rules from templates or from scratch</li>
                  <li>Adjust rule severity levels and enforcement modes (Monitor, Warn, Block)</li>
                  <li>Enable or disable rules without deleting them</li>
                  <li>View rule trigger history and violation patterns</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="systems" className="border-border/30">
              <AccordionTrigger className="text-sm py-3 hover:no-underline">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary/70" />
                  AI System Management
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-2 pb-4">
                <p>When the <strong>Manage AI Systems</strong> permission is enabled, reviewers can:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>View and edit AI system configurations (risk tier, provider, model type)</li>
                  <li>Track AI system versions and change history</li>
                  <li>Monitor data lineage and governance notes</li>
                  <li>Review bias and fairness audit results</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="deployments" className="border-border/30">
              <AccordionTrigger className="text-sm py-3 hover:no-underline">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary/70" />
                  Deployment Approvals
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-2 pb-4">
                <p>When the <strong>Approve Deployments</strong> permission is enabled, reviewers can:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Review the pre-deployment readiness checklist for each AI system</li>
                  <li>Approve or block AI system deployments based on compliance status</li>
                  <li>Verify that all required governance checks have been completed</li>
                  <li>Add approval notes that feed into the audit trail</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="audit" className="border-border/30">
              <AccordionTrigger className="text-sm py-3 hover:no-underline">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary/70" />
                  Audit Trail & Evidence
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-2 pb-4">
                <p>Every reviewer action automatically generates audit evidence:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>All review decisions are logged with timestamps, reviewer ID, and cryptographic integrity hashes</li>
                  <li>Rule changes and system modifications are version-tracked</li>
                  <li>Deployment approvals create a permanent compliance record</li>
                  <li>This evidence is ready for EU AI Act, ISO 42001, and NIST AI RMF audits</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="rounded-lg border border-border/50 bg-background/40 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Data isolation guarantee
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your reviewer only sees data belonging to your organization. They cannot access other customers' data, and they cannot see your billing, subscription, or account settings. All access is enforced at the database level with row-level security.
            </p>
          </div>
        </div>
      </ContentCard>
    </div>
  );
}
