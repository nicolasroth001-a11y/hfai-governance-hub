import { SectionHeader } from "@/components/SectionHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AdminHumanFirstFramework() {
  return (
    <div className="space-y-8 max-w-3xl">
      <SectionHeader
        title="Human-First AI Framework"
        description="Internal governance doctrine for responsible AI oversight"
      />

      <Accordion type="multiple" defaultValue={["purpose"]} className="space-y-3">
        <AccordionItem
          value="purpose"
          className="bg-card rounded-2xl border border-border/40 shadow-sm px-8 py-2 data-[state=open]:shadow-md transition-shadow"
        >
          <AccordionTrigger className="text-lg font-bold tracking-tight hover:no-underline text-[#1C1A17]">
            The Purpose (Foundational Statement)
          </AccordionTrigger>
          <AccordionContent className="text-body leading-relaxed text-muted-foreground space-y-4 pr-4">
            <h2 className="text-xl font-semibold text-[#C8A96E] mb-4 mt-2 tracking-tight">The Purpose (Foundational Statement)</h2>
            <p>
              Humanity stands at a turning point. Artificial Intelligence is advancing at a pace
              that outstrips our ability to regulate, understand, or contain it. While AI offers
              extraordinary potential to solve problems and improve lives, its unregulated use has
              already caused measurable harm — from lost jobs and destabilized communities to
              damaged reputations and the erosion of trust in what is real.
            </p>
            <p>
              We believe in technology. We believe in innovation. We believe AI can be a powerful
              tool for human progress. But we also believe that AI must remain exactly that: a
              tool. A tool in the human toolbox — never a replacement for human judgment, dignity,
              or livelihood.
            </p>
            <p>
              The purpose of this framework is to establish strict, enforceable rules that ensure
              AI always serves humanity, never overrides it, never harms it, and never makes
              decisions that affect a person's life without transparent, accountable, and
              human‑centered oversight. This is a human world, and it must remain governed by
              humans.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="laws"
          className="bg-card rounded-2xl border border-border/40 shadow-sm px-8 py-2 data-[state=open]:shadow-md transition-shadow"
        >
          <AccordionTrigger className="text-lg font-bold tracking-tight hover:no-underline text-[#1C1A17]">
            SECTION 2 — The Human‑First Laws (Loophole‑Proof Version)
          </AccordionTrigger>
          <AccordionContent className="text-body leading-relaxed text-muted-foreground space-y-6 pr-4">
            <h2 className="text-xl font-semibold text-[#C8A96E] mb-4 mt-2 tracking-tight">SECTION 2 — The Human‑First Laws</h2>
            <p>
              This is the fully reinforced, airtight version. These laws define the mandatory
              boundaries for all AI systems operating within human environments. They are written
              to eliminate ambiguity, prevent exploitation, and ensure that AI remains a tool under
              human authority.
            </p>

            <div className="space-y-6 pt-2">
              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 1 — Human Authority Is Absolute</h3>
                <p>AI may analyze, predict, or recommend, but it may never execute or finalize any action that affects a person's employment, opportunities, reputation, or well‑being. All consequential decisions require documented human reasoning, not passive approval.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 2 — AI Use Must Be Fully Transparent</h3>
                <p>Any automated system — including algorithms, scoring models, filters, or machine‑learning tools — must be disclosed as AI. Renaming or reclassifying a system does not exempt it from these rules.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 3 — All AI Activity Must Be Logged and Traceable</h3>
                <p>Every AI‑generated output must include:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>timestamp</li>
                  <li>model or system identity</li>
                  <li>data sources used</li>
                  <li>explanation of reasoning</li>
                  <li>human reviewer identity</li>
                  <li>final human decision</li>
                </ul>
                <p>Logs must be accessible for audits, disputes, and oversight.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 4 — Individuals Must Be Notified of AI Involvement</h3>
                <p>If AI influences or evaluates a person — directly or indirectly — the individual must be notified. This includes group‑level, team‑level, or department‑level AI actions.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 5 — Individuals Have the Right to Dispute Any AI‑Influenced Action</h3>
                <p>Any person affected by an AI‑influenced decision may challenge it. A human reviewer must investigate the dispute, review the logs, and issue a final decision with documented reasoning.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 6 — High‑Impact Decisions Require Mandatory Human Review</h3>
                <p>AI may not finalize or trigger actions involving:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>hiring or rejection</li>
                  <li>firing or termination</li>
                  <li>suspension</li>
                  <li>demotion</li>
                  <li>pay changes</li>
                  <li>schedule changes</li>
                  <li>performance scoring</li>
                  <li>disciplinary action</li>
                  <li>workload distribution</li>
                  <li>opportunity allocation</li>
                </ul>
                <p>This includes direct and indirect impacts.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 7 — AI Must Provide Explainable Reasoning</h3>
                <p>AI outputs must be interpretable and understandable. If an AI system cannot explain its reasoning in human terms, its output cannot be used in any decision‑making process.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 8 — AI Cannot Reduce Human Employment Without a Human‑Approved Transition Plan</h3>
                <p>If automation affects tasks, roles, or hours, employers must provide:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>retraining</li>
                  <li>reassignment</li>
                  <li>or compensation</li>
                </ul>
                <p>Automating tasks that effectively eliminate a job is treated as job impact.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 9 — Human Judgment Overrides AI in All Cases</h3>
                <p>If a human reviewer disagrees with an AI recommendation, the human decision is final. AI may not retry, escalate, or override without explicit human instruction.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 10 — AI Must Serve Human Well‑Being Over Efficiency</h3>
                <p>AI systems must be designed and deployed to support human dignity, fairness, safety, and opportunity. Efficiency gains do not justify actions that negatively impact people.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 11 — Companies Are Responsible for All AI They Deploy</h3>
                <p>Organizations are accountable for the behavior of all AI systems they use, including third‑party tools, vendors, contractors, and embedded systems. Outsourcing does not remove responsibility.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 12 — AI‑Generated or AI‑Altered Media Depicting Real People Requires Consent</h3>
                <p>Any AI‑generated or AI‑modified media involving a real person — including images, videos, audio, or likeness — must be authenticated and consented. This includes enhancements, edits, face swaps, voice cloning, and synthetic media.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 13 — AI May Not Impersonate Humans</h3>
                <p>AI systems may not generate content intended to mimic, imitate, or represent a real person without explicit consent. This includes voices, faces, writing styles, and digital identities.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">LAW 14 — AI May Not Be Used to Mislead, Deceive, or Slander</h3>
                <p>AI systems may not generate false information about real individuals, including fabricated events, statements, or behaviors. Authenticity checks and watermarking are required for all AI‑generated media.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="rights"
          className="bg-card rounded-2xl border border-border/40 shadow-sm px-8 py-2 data-[state=open]:shadow-md transition-shadow"
        >
          <AccordionTrigger className="text-lg font-bold tracking-tight hover:no-underline text-[#1C1A17]">
            SECTION 3 — Worker Rights &amp; Company Rights (Fairness for Both Sides)
          </AccordionTrigger>
          <AccordionContent className="text-body leading-relaxed text-muted-foreground space-y-6 pr-4">
            <h2 className="text-xl font-semibold text-[#C8A96E] mb-4 mt-2 tracking-tight">SECTION 3 — Worker Rights &amp; Company Rights</h2>
            <p>
              This section defines the protections for workers and the protections for companies so the system is balanced, enforceable, and realistic. The goal is not to punish companies unfairly, but to prevent harm, resolve disputes, and keep AI in its proper role.
            </p>
            <p>This section has two halves:</p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Worker Rights — protections for individuals</li>
              <li>Company Rights — protections for organizations</li>
            </ol>
            <p>Both are necessary, clear, and enforceable.</p>

            <div className="space-y-6 pt-2">
              <h2 className="text-foreground font-bold text-base tracking-tight">A. Worker Rights (Strict, Clear, Non‑Negotiable)</h2>
              <p>These rights ensure that workers are protected from AI misuse, unfair treatment, and hidden automation.</p>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 1 — The Right to Know</h3>
                <p>Workers must be informed whenever AI is used to evaluate, analyze, or influence decisions about them.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 2 — The Right to Access Logs</h3>
                <p>Workers may view all AI‑related records involving them, including reasoning, data sources, and human reviewer notes.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 3 — The Right to Dispute</h3>
                <p>Workers may challenge any AI‑influenced action and request human review.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 4 — The Right to Human Review</h3>
                <p>A trained human must investigate disputes and issue a final decision with documented reasoning.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 5 — The Right to Fair Treatment</h3>
                <p>Workers may not be penalized, retaliated against, or disadvantaged for disputing an AI‑influenced action.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 6 — The Right to Correction</h3>
                <p>If an AI‑influenced action is found to be harmful or inaccurate, workers have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>reinstatement</li>
                  <li>restored hours</li>
                  <li>restored pay</li>
                  <li>corrected records</li>
                  <li>priority consideration for future opportunities</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 7 — The Right to Authenticity</h3>
                <p>Workers have the right to protection from:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>AI‑generated impersonation</li>
                  <li>AI‑generated slander</li>
                  <li>AI‑generated fake media</li>
                  <li>AI‑generated harassment</li>
                </ul>
                <p>This protects identity and reputation.</p>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h2 className="text-foreground font-bold text-base tracking-tight">B. Company Rights (Fair, Balanced, Realistic)</h2>
              <p>Companies need protection too — from false claims, misunderstandings, and being punished for honest mistakes.</p>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 1 — The Right to Clear Standards</h3>
                <p>Companies must receive clear, unambiguous rules about what is allowed and what is prohibited.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 2 — The Right to Due Process</h3>
                <p>If a violation is flagged, companies have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>review the logs</li>
                  <li>provide context</li>
                  <li>submit evidence</li>
                  <li>explain their actions</li>
                </ul>
                <p>No automatic punishment.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 3 — The Right to Correct Mistakes</h3>
                <p>If a violation was unintentional, companies may correct the issue without penalty on the first offense.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 4 — The Right to Appeal</h3>
                <p>Companies may appeal decisions made by human reviewers or oversight bodies.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 5 — The Right to Use AI Responsibly</h3>
                <p>Companies may use AI for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>efficiency</li>
                  <li>analysis</li>
                  <li>forecasting</li>
                  <li>support</li>
                  <li>safety</li>
                  <li>quality control</li>
                </ul>
                <p>As long as it does not replace, harm, or unfairly evaluate humans.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 6 — The Right to Vendor Accountability</h3>
                <p>Companies are not punished for vendor misconduct if:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>they were unaware</li>
                  <li>they acted in good faith</li>
                  <li>they correct the issue immediately</li>
                </ul>
                <p>This protects companies from third‑party failures.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">RIGHT 7 — The Right to Innovation</h3>
                <p>Companies may innovate with AI as long as:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>humans remain in control</li>
                  <li>workers are protected</li>
                  <li>transparency is maintained</li>
                  <li>decisions remain human‑made</li>
                </ul>
                <p>This keeps the system pro‑innovation, not anti‑technology.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="audits"
          className="bg-card rounded-2xl border border-border/40 shadow-sm px-8 py-2 data-[state=open]:shadow-md transition-shadow"
        >
          <AccordionTrigger className="text-lg font-bold tracking-tight hover:no-underline text-[#1C1A17]">
            SECTION 4 — AI Audit Requirements (Strict, Fair, and Enforceable)
          </AccordionTrigger>
          <AccordionContent className="text-body leading-relaxed text-muted-foreground space-y-6 pr-4">
            <h2 className="text-xl font-semibold text-[#C8A96E] mb-4 mt-2 tracking-tight">SECTION 4 — AI Audit Requirements</h2>
            <p>
              AI audits are the backbone of accountability. They ensure that companies follow the rules, workers are protected, and AI stays within its boundaries. But they must also be fair, transparent, and non‑punitive when companies act in good faith.
            </p>

            <div className="space-y-6 pt-2">
              <h2 className="text-foreground font-bold text-base tracking-tight">A. Purpose of AI Audits</h2>
              <p>AI audits exist to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>verify compliance with the Human‑First Laws</li>
                <li>protect workers from harm</li>
                <li>protect companies from false claims</li>
                <li>ensure transparency</li>
                <li>detect misuse early</li>
                <li>maintain trust in AI systems</li>
              </ul>
              <p>Audits are not designed to punish companies — they are designed to prevent harm and correct issues before they escalate.</p>
            </div>

            <div className="space-y-6 pt-4">
              <h2 className="text-foreground font-bold text-base tracking-tight">B. Mandatory AI Audit Types</h2>
              <p>Your system will require three categories of audits:</p>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">1. Routine Compliance Audits (Scheduled)</h3>
                <p>Performed at regular intervals (e.g., quarterly or biannually). These audits check:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>AI logs</li>
                  <li>human review records</li>
                  <li>dispute outcomes</li>
                  <li>transparency notifications</li>
                  <li>data sources</li>
                  <li>model behavior</li>
                  <li>adherence to the Human‑First Laws</li>
                </ul>
                <p>These are predictable and fair — companies know when they're coming.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">2. Triggered Audits (Event‑Based)</h3>
                <p>Activated when:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>a worker disputes an AI‑influenced action</li>
                  <li>the supervisory AI flags a violation</li>
                  <li>a company reports an internal issue</li>
                  <li>unusual patterns appear in logs</li>
                </ul>
                <p>Triggered audits are focused, not broad. They investigate the specific event or pattern.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">3. Deep Audits (High‑Impact)</h3>
                <p>Reserved for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>repeated violations</li>
                  <li>evidence of systemic misuse</li>
                  <li>major harm to workers</li>
                  <li>large‑scale automation attempts</li>
                  <li>AI impersonation or deepfake misuse</li>
                </ul>
                <p>Deep audits are comprehensive and involve:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>full system review</li>
                  <li>vendor review</li>
                  <li>policy review</li>
                  <li>human reviewer interviews</li>
                  <li>data integrity checks</li>
                </ul>
                <p>These are rare and only used when necessary.</p>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h2 className="text-foreground font-bold text-base tracking-tight">C. Audit Fairness Principles (Protecting Companies)</h2>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">1. Presumption of Good Faith</h3>
                <p>Audits begin with the assumption that the company intended to comply.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">2. Right to Respond</h3>
                <p>Companies may provide:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>context</li>
                  <li>explanations</li>
                  <li>evidence</li>
                  <li>logs</li>
                  <li>corrective actions</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">3. No Penalty for Honest Mistakes</h3>
                <p>If a violation was unintentional and corrected promptly, no penalty is applied.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">4. Vendor Accountability Protection</h3>
                <p>If a third‑party AI tool caused the issue, and the company acted responsibly, penalties are reduced or waived.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">5. Transparent Audit Criteria</h3>
                <p>Companies know exactly what auditors look for — no surprises.</p>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h2 className="text-foreground font-bold text-base tracking-tight">D. Audit Requirements (Strict and Clear)</h2>
              <p>Every audit must include:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>review of all AI logs</li>
                <li>review of human reviewer decisions</li>
                <li>verification of worker notifications</li>
                <li>verification of dispute handling</li>
                <li>checks for hidden automation</li>
                <li>checks for unauthorized AI tools</li>
                <li>checks for deepfake or impersonation misuse</li>
                <li>checks for compliance with the Human‑First Laws</li>
              </ul>
              <p>This ensures audits are consistent, fair, and thorough.</p>
            </div>

            <div className="space-y-6 pt-4">
              <h2 className="text-foreground font-bold text-base tracking-tight">E. Audit Outcomes (Balanced and Proportionate)</h2>
              <p>Audit results fall into four categories:</p>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">1. Compliant</h3>
                <p>No issues. Company receives certification.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">2. Correctable Issues</h3>
                <p>Minor violations fixed with:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>training</li>
                  <li>policy updates</li>
                  <li>system adjustments</li>
                </ul>
                <p>No penalties.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">3. Significant Violations</h3>
                <p>Requires:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>corrective action plan</li>
                  <li>follow‑up audit</li>
                  <li>temporary suspension of certain AI features</li>
                </ul>
                <p>Still fair, still human‑controlled.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">4. Severe or Repeated Violations</h3>
                <p>May trigger:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>deep audit</li>
                  <li>human‑only mode</li>
                  <li>formal consequences</li>
                </ul>
                <p>Always decided by humans, never by AI.</p>
              </div>
            </div>

            <p className="pt-4 italic">
              This audit system protects workers, protects companies, prevents harm, ensures fairness, builds trust, and keeps AI in its proper place — without being punitive or anti‑innovation.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="oversight"
          className="bg-card rounded-2xl border border-border/40 shadow-sm px-8 py-2 data-[state=open]:shadow-md transition-shadow"
        >
          <AccordionTrigger className="text-lg font-bold tracking-tight hover:no-underline text-[#1C1A17]">
            SECTION 5 — Oversight &amp; Accountability
          </AccordionTrigger>
          <AccordionContent className="text-body leading-relaxed text-muted-foreground space-y-6 pr-4">
            <h2 className="text-xl font-semibold text-[#C8A96E] mb-4 mt-2 tracking-tight">SECTION 5 — Oversight &amp; Accountability</h2>
            <p>
              This section defines the dual‑layer oversight model that ensures AI systems remain accountable, transparent, and subordinate to human judgment. The model consists of two layers:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>AI Alert System (Automated Monitoring)</li>
              <li>Human Oversight Board (Human Judgment &amp; Authority)</li>
            </ol>
            <p>
              Together, they create a balanced system where AI provides speed and detection, while humans provide fairness, context, and final authority.
            </p>

            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">A. AI Alert System (Automated Violation Detection)</h4>
                <p>
                  This system continuously monitors AI activity across the organization. It does not make decisions, issue punishments, or override humans. Its role is to detect, log, and alert.
                </p>
                <p>The AI Alert System automatically flags:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>attempts to fire, suspend, or discipline a worker</li>
                  <li>hidden automation</li>
                  <li>unauthorized AI tools</li>
                  <li>missing human review</li>
                  <li>unusual patterns in decisions</li>
                  <li>potential discrimination</li>
                  <li>deepfake or impersonation attempts</li>
                  <li>violations of the Human‑First Laws</li>
                  <li>repeated disputes involving the same system</li>
                  <li>attempts to bypass transparency requirements</li>
                </ul>
                <p>AI excels at identifying:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>patterns</li>
                  <li>anomalies</li>
                  <li>repeated behaviors</li>
                  <li>statistical irregularities</li>
                  <li>attempts to conceal actions</li>
                </ul>
                <p>
                  Humans cannot manually monitor millions of data points. The AI Alert System fills this gap, but it only alerts — it never acts.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">B. Human Oversight Board (Final Authority)</h4>
                <p>
                  This is the human layer responsible for reviewing alerts, investigating disputes, examining logs, interviewing individuals, making final decisions, issuing corrective actions, and ensuring fairness for both workers and companies.
                </p>
                <p>The Human Oversight Board handles:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>all disputes</li>
                  <li>all flagged violations</li>
                  <li>all appeals</li>
                  <li>all audit results</li>
                  <li>all corrective actions</li>
                  <li>all enforcement decisions</li>
                </ul>
                <p>
                  Humans understand nuance, context, intent, fairness, ethics, and lived experience. AI cannot replicate these qualities, which is why humans remain the final authority.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">C. The Dual‑Layer Oversight Model</h4>
                <p>This model can be summarized as:</p>
                <p className="italic pl-4">
                  AI monitors. Humans decide.<br />
                  AI detects. Humans interpret.<br />
                  AI alerts. Humans enforce.
                </p>
                <p>This structure protects:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>workers</li>
                  <li>companies</li>
                  <li>communities</li>
                  <li>reputations</li>
                  <li>fairness</li>
                  <li>truth</li>
                </ul>
                <p>It ensures AI remains a tool, not a decision‑maker.</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">D. Why This Works</h4>
                <p>
                  AI alone is too fast and too literal, often missing context and fairness. Humans alone are too slow and limited to monitor large‑scale systems. Together, they create a governance model that is:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>fast</li>
                  <li>fair</li>
                  <li>transparent</li>
                  <li>accountable</li>
                  <li>enforceable</li>
                  <li>balanced</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="enforcement"
          className="bg-card rounded-2xl border border-border/40 shadow-sm px-8 py-2 data-[state=open]:shadow-md transition-shadow"
        >
          <AccordionTrigger className="text-lg font-bold tracking-tight hover:no-underline text-[#1C1A17]">
            SECTION 6 — Enforcement &amp; Consequences
          </AccordionTrigger>
          <AccordionContent className="text-body leading-relaxed text-muted-foreground space-y-6 pr-4">
            <h2 className="text-xl font-semibold text-[#C8A96E] mb-4 mt-2 tracking-tight">SECTION 6 — Enforcement &amp; Consequences</h2>
            <p>
              This section defines the professional, balanced, and enforceable system used to ensure accountability while protecting both workers and companies. Enforcement is not about punishment; it is about correction, fairness, and preventing harm. The system uses a tiered, human‑controlled model that ensures violations are addressed proportionally and transparently.
            </p>

            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">A. Enforcement Principles</h4>
                <p>These principles guide every enforcement action:</p>
                <div className="space-y-3 pl-2">
                  <div><strong>1. Human‑Led Enforcement</strong><br />AI never punishes, suspends, or restricts anything. Humans make all enforcement decisions.</div>
                  <div><strong>2. Proportionality</strong><br />Consequences match the severity and frequency of the violation.</div>
                  <div><strong>3. Good Faith Protection</strong><br />Companies acting responsibly and transparently receive leniency.</div>
                  <div><strong>4. No Retaliation</strong><br />Workers cannot be punished for disputing. Companies cannot be punished for self‑reporting issues.</div>
                  <div><strong>5. Transparency</strong><br />All enforcement actions must be documented and visible to both sides.</div>
                  <div><strong>6. Corrective First, Punitive Last</strong><br />The goal is to fix problems, not punish honest mistakes.</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">B. The Enforcement Ladder</h4>
                <p>This is the structured, predictable consequence model. It has four levels, escalating only when necessary.</p>

                <div className="space-y-4 pl-2">
                  <div className="space-y-2">
                    <strong>LEVEL 1 — Corrective Notice (First Violation)</strong>
                    <p>Used for minor violations, unintentional errors, misunderstandings, missing documentation, or transparency lapses.</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>notification to the company</li>
                      <li>explanation of the issue</li>
                      <li>corrective steps</li>
                      <li>no penalty</li>
                      <li>no public record</li>
                      <li>no strike</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <strong>LEVEL 2 — Formal Warning (Second Violation)</strong>
                    <p>Used when the same issue repeats, corrective steps were ignored, or transparency was intentionally bypassed.</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>formal written warning</li>
                      <li>required training</li>
                      <li>required policy update</li>
                      <li>scheduled follow‑up audit</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <strong>LEVEL 3 — Restricted AI Use (Third Violation)</strong>
                    <p>Used when violations become a pattern, workers are harmed, AI is repeatedly misused, or transparency is intentionally avoided.</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>temporary disabling of specific AI features</li>
                      <li>human‑only mode for affected areas</li>
                      <li>mandatory deep audit</li>
                      <li>corrective action plan</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <strong>LEVEL 4 — Full Human‑Only Mode (Severe or Repeated Violations)</strong>
                    <p>Used when violations are severe, repeated, harmful, or involve refusal to comply, deepfake misuse, or AI‑driven disciplinary actions without human review.</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>disabling all AI systems</li>
                      <li>full human‑only operation</li>
                      <li>comprehensive oversight review</li>
                      <li>reinstatement or compensation for affected workers</li>
                      <li>public compliance report</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">C. Worker Remedies</h4>
                <p>If a worker is harmed by AI misuse, they receive:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>reinstatement</li>
                  <li>restored hours</li>
                  <li>restored pay</li>
                  <li>corrected records</li>
                  <li>priority review for future opportunities</li>
                  <li>written apology (optional but encouraged)</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">D. Company Protections</h4>
                <p>Companies are protected from:</p>
                <div className="space-y-2 pl-2">
                  <div><strong>1. False Claims</strong> — all disputes require evidence and logs.</div>
                  <div><strong>2. Vendor Misconduct</strong> — penalties reduced or waived if the company acted responsibly.</div>
                  <div><strong>3. Punishment for Self‑Reporting</strong> — voluntary reporting receives leniency.</div>
                  <div><strong>4. Over‑Enforcement</strong> — consequences must be proportional and justified.</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">E. Enforcement Transparency</h4>
                <p>Every enforcement action must include:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>what happened</li>
                  <li>which rule was violated</li>
                  <li>evidence from logs</li>
                  <li>human reviewer reasoning</li>
                  <li>corrective steps</li>
                  <li>compliance timeline</li>
                </ul>
                <p>This ensures fairness and prevents bias.</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">F. Appeals Process</h4>
                <p>Companies may appeal any enforcement action. Appeals must be:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>reviewed by a separate human panel</li>
                  <li>based on evidence</li>
                  <li>resolved within a defined timeframe</li>
                  <li>documented transparently</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="deepfake"
          className="bg-card rounded-2xl border border-border/40 shadow-sm px-8 py-2 data-[state=open]:shadow-md transition-shadow"
        >
          <AccordionTrigger className="text-lg font-bold tracking-tight hover:no-underline text-[#1C1A17]">
            SECTION 7 — Anti‑Deepfake &amp; Identity Protection Standards
          </AccordionTrigger>
          <AccordionContent className="text-body leading-relaxed text-muted-foreground space-y-6 pr-4">
            <h2 className="text-xl font-semibold text-[#C8A96E] mb-4 mt-2 tracking-tight">SECTION 7 — Anti‑Deepfake &amp; Identity Protection Standards</h2>
            <p>
              This section establishes strict, fair, and enforceable rules that protect human identity, reputation, and reality. AI has made it possible to fabricate images, videos, audio, and written content that convincingly depict real people doing or saying things they never did. These protections apply to workers, private citizens, public figures, companies, creators, minors, and vulnerable individuals.
            </p>

            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">A. Identity Protection Principles</h4>
                <p>These principles guide all rules in this section:</p>
                <div className="space-y-3 pl-2">
                  <div><strong>1. Consent Is Mandatory</strong><br />No AI system may generate or alter media depicting a real person without their explicit consent.</div>
                  <div><strong>2. Authenticity Is Required</strong><br />All AI‑generated or AI‑altered media must be clearly labeled and traceable.</div>
                  <div><strong>3. No Deception</strong><br />AI may not be used to mislead, impersonate, or fabricate events involving real people.</div>
                  <div><strong>4. No Harm</strong><br />AI may not be used to damage a person's reputation, dignity, or safety.</div>
                  <div><strong>5. Human Oversight</strong><br />All identity‑related violations must be reviewed and judged by humans.</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">B. Prohibited AI Actions</h4>
                <p>The following uses of AI are strictly prohibited:</p>
                <div className="space-y-3 pl-2">
                  <div><strong>1. Deepfake Videos of Real People</strong><br />No AI‑generated or AI‑altered video may depict a real person without consent.</div>
                  <div><strong>2. AI‑Generated Photos of Real People</strong><br />No synthetic images may place a real person in false events, locations, actions, or contexts.</div>
                  <div><strong>3. AI Voice Cloning Without Consent</strong><br />No AI may replicate a person's voice for impersonation, deception, harassment, fraud, or slander.</div>
                  <div><strong>4. AI‑Generated Slander or Fabricated Statements</strong><br />AI may not generate fake quotes, confessions, accusations, messages, or interviews.</div>
                  <div><strong>5. AI Impersonation in Text or Digital Identity</strong><br />AI may not imitate a person's writing style, communication patterns, digital identity, or social media presence without explicit permission.</div>
                  <div><strong>6. AI‑Generated Harassment or Targeted Abuse</strong><br />AI may not create content intended to shame, threaten, humiliate, intimidate, or defame any individual.</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">C. Allowed AI Uses</h4>
                <p>To maintain fairness and support innovation, the following uses are allowed:</p>
                <div className="space-y-3 pl-2">
                  <div><strong>1. AI‑Generated Fictional Characters</strong><br />AI may create fictional people not based on real individuals.</div>
                  <div><strong>2. AI‑Generated Media With Consent</strong><br />Creators, companies, and individuals may generate media of themselves or others with documented consent.</div>
                  <div><strong>3. AI‑Assisted Editing With Transparency</strong><br />AI may enhance or edit real media if edits are disclosed, do not misrepresent reality, and the person depicted approves.</div>
                  <div><strong>4. AI for Education, Art, and Research</strong><br />AI may generate synthetic media for training, education, artistic expression, or research, as long as no real person is depicted without consent.</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">D. Authenticity &amp; Watermarking Requirements</h4>
                <p>All AI‑generated or AI‑altered media must include:</p>
                <div className="space-y-3 pl-2">
                  <div><strong>1. Invisible Watermarking</strong><br />Embedded metadata identifying the AI system, model, timestamp, creator, and purpose.</div>
                  <div><strong>2. Visible Labeling</strong><br />A clear label such as "AI‑Generated," "AI‑Altered," or "Synthetic Media."</div>
                  <div><strong>3. Traceable Logs</strong><br />Every piece of synthetic media must be traceable back to the creator, system, source files, and consent record.</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">E. Violation Detection</h4>
                <p>The dual‑layer oversight model applies here:</p>
                <p><strong>AI Alert System Flags:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>deepfake patterns</li>
                  <li>voice cloning attempts</li>
                  <li>synthetic face swaps</li>
                  <li>impersonation attempts</li>
                  <li>metadata tampering</li>
                  <li>unlabeled AI media</li>
                </ul>
                <p><strong>Human Oversight Board Reviews:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>context</li>
                  <li>intent</li>
                  <li>harm</li>
                  <li>consent</li>
                  <li>evidence</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">F. Consequences for Identity Violations</h4>
                <p>Consequences follow the proportional enforcement ladder defined in Section 6, with additional protections for victims.</p>
                <p><strong>For Individuals Harmed:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>immediate removal of harmful content</li>
                  <li>public correction if necessary</li>
                  <li>restored reputation records</li>
                  <li>legal support (optional)</li>
                  <li>compensation if harm is proven</li>
                </ul>
                <p><strong>For Companies:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>corrective action</li>
                  <li>training</li>
                  <li>restricted AI use</li>
                  <li>human‑only mode for media tools</li>
                  <li>deep audit for repeated violations</li>
                </ul>
                <p><strong>For Severe Misuse:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>full suspension of AI media tools</li>
                  <li>mandatory human‑only mode</li>
                  <li>public compliance report</li>
                </ul>
                <p>All decisions are human‑made and evidence‑based.</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">G. Appeals &amp; Fairness Protections</h4>
                <p>
                  Companies and individuals may appeal identity‑related rulings. Appeals must be reviewed by a separate human panel, based on evidence, resolved promptly, and documented transparently.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="finalization"
          className="bg-card rounded-2xl border border-border/40 shadow-sm px-8 py-2 data-[state=open]:shadow-md transition-shadow"
        >
          <AccordionTrigger className="text-lg font-bold tracking-tight hover:no-underline text-[#1C1A17]">
            SECTION 8 — Finalization &amp; Constitutional Freeze
          </AccordionTrigger>
          <AccordionContent className="text-body leading-relaxed text-muted-foreground space-y-6 pr-4">
            <h2 className="text-xl font-semibold text-[#C8A96E] mb-4 mt-2 tracking-tight">SECTION 8 — Finalization &amp; Constitutional Freeze</h2>
            <p>
              This section establishes the rules that lock the governance framework, protect it from dilution or misuse, and ensure long‑term stability. A governance system is only as strong as its ability to remain consistent over time. This freeze layer ensures no one can quietly weaken the protections within this framework.
            </p>

            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">A. Constitutional Freeze</h4>
                <p>Once Phase 1 is completed and approved:</p>
                <div className="space-y-3 pl-2">
                  <div><strong>1. No section may be altered without formal review.</strong><br />This prevents unauthorized edits or weakening of protections.</div>
                  <div><strong>2. All laws, rights, audits, and oversight rules become binding.</strong><br />They apply to all AI systems under this governance model.</div>
                  <div><strong>3. All companies and vendors must comply with the frozen version.</strong><br />No exceptions or opt‑outs.</div>
                  <div><strong>4. Any attempt to bypass or weaken the framework is treated as a violation.</strong><br />This protects the integrity of the system.</div>
                </div>
                <p>The freeze ensures the foundation remains strong and stable.</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">B. Amendment Protocol</h4>
                <p>Updates are allowed, but only through a strict, transparent process:</p>
                <div className="space-y-3 pl-2">
                  <div><strong>1. Proposed amendments must be written and submitted formally.</strong><br />No verbal or informal changes.</div>
                  <div><strong>2. Amendments must be reviewed by a human oversight panel.</strong><br />AI cannot propose or approve amendments.</div>
                  <div>
                    <strong>3. Amendments must be evaluated for:</strong>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>human impact</li>
                      <li>worker protection</li>
                      <li>company fairness</li>
                      <li>ethical alignment</li>
                      <li>long‑term consequences</li>
                    </ul>
                  </div>
                  <div><strong>4. Amendments require supermajority approval.</strong><br />This prevents rushed or biased changes.</div>
                  <div><strong>5. All amendments must be publicly documented.</strong><br />Transparency protects all parties.</div>
                </div>
                <p>This ensures the framework evolves responsibly and deliberately.</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">C. Non‑Regression Clause</h4>
                <p>No amendment may weaken or remove protections for:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>human rights</li>
                  <li>worker rights</li>
                  <li>identity protections</li>
                  <li>transparency</li>
                  <li>oversight</li>
                  <li>accountability</li>
                  <li>human authority</li>
                </ul>
                <p>This prevents future leaders or organizations from eroding the protections built into the system. The framework must always remain human‑first.</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">D. AI Non‑Authority Clause</h4>
                <p>This clause permanently establishes the hierarchy:</p>
                <p>AI may never:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>approve amendments</li>
                  <li>vote on changes</li>
                  <li>override human decisions</li>
                  <li>alter the constitution</li>
                  <li>modify logs</li>
                  <li>modify oversight rules</li>
                  <li>modify enforcement rules</li>
                </ul>
                <p>AI is permanently excluded from governance authority.</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">E. Public Access &amp; Transparency Requirements</h4>
                <p>To maintain trust:</p>
                <div className="space-y-3 pl-2">
                  <div><strong>1. The full governance framework must be publicly accessible.</strong><br />No hidden rules.</div>
                  <div><strong>2. All amendments must be published.</strong><br />No secret changes.</div>
                  <div><strong>3. All enforcement actions must be documented.</strong><br />No silent penalties or favoritism.</div>
                  <div><strong>4. Workers and companies must be able to view the current version at any time.</strong><br />Everyone knows the rules.</div>
                </div>
                <p>This ensures openness, honesty, and accountability.</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">F. Long‑Term Stewardship</h4>
                <p>This section defines who protects the constitution over time:</p>
                <div className="space-y-3 pl-2">
                  <div><strong>1. A Human Governance Council oversees the framework.</strong><br />Independent, trained, and accountable.</div>
                  <div>
                    <strong>2. The council must include:</strong>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>worker representatives</li>
                      <li>company representatives</li>
                      <li>ethics experts</li>
                      <li>legal experts</li>
                      <li>technologists</li>
                      <li>community advocates</li>
                    </ul>
                  </div>
                  <div>
                    <strong>3. The council meets at defined intervals to review:</strong>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>audit trends</li>
                      <li>dispute patterns</li>
                      <li>new AI risks</li>
                      <li>amendment proposals</li>
                    </ul>
                  </div>
                  <div><strong>4. The council cannot weaken protections — only strengthen them.</strong><br />This ensures the mission remains intact.</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">G. Mission Preservation Clause</h4>
                <p>The purpose of this framework may never be altered.</p>
                <p>AI must always remain:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>a tool</li>
                  <li>supervised</li>
                  <li>transparent</li>
                  <li>accountable</li>
                  <li>human‑controlled</li>
                </ul>
                <p>Humans must always remain:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>the decision‑makers</li>
                  <li>the authority</li>
                  <li>the protected party</li>
                  <li>the center of the system</li>
                </ul>
                <p>This clause ensures the founding vision cannot be corrupted.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
