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

      <Accordion type="single" collapsible defaultValue="purpose" className="space-y-3">
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
      </Accordion>
    </div>
  );
}
