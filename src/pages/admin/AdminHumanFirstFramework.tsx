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
          <AccordionTrigger className="text-lg font-semibold tracking-tight hover:no-underline">
            The Purpose (Foundational Statement)
          </AccordionTrigger>
          <AccordionContent className="text-body leading-relaxed text-muted-foreground space-y-4 pr-4">
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
          <AccordionTrigger className="text-lg font-semibold tracking-tight hover:no-underline">
            SECTION 2 — The Human‑First Laws (Loophole‑Proof Version)
          </AccordionTrigger>
          <AccordionContent className="text-body leading-relaxed text-muted-foreground space-y-6 pr-4">
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
      </Accordion>
    </div>
  );
}
