import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does HFAI integrate with my AI systems?",
    a: "HFAI provides a proxy endpoint. Just paste your OpenAI API key, swap your base URL, and every AI call is automatically monitored — no custom code needed. Setup takes less than 2 minutes.",
  },
  {
    q: "What types of AI violations can HFAI detect?",
    a: "Content safety violations, bias detection, PII exposure, hallucination patterns, unauthorized data access, prompt injection attempts, and custom rules you define for your specific use case.",
  },
  {
    q: "What is Root Cause Analysis?",
    a: "Our AI-powered RCA engine diagnoses why violations occur, suggests rule changes, identifies recurring patterns, and generates remediation checklists — all validated by human reviewers.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All data is encrypted at rest and in transit. We follow SOC 2 aligned practices, and your data never leaves your environment without explicit permission.",
  },
];

export function FAQSection() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={`faq-${i}`} className="border-border/30">
          <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary text-left">
            {faq.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
