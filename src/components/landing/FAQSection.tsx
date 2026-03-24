import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does HFAI integrate with my AI systems?",
    a: "HFAI offers two integration methods. The Proxy (Zero-Code) lets you swap your OpenAI base URL to the HFAI endpoint — every call is monitored automatically with no code changes. The REST API works with any AI provider (Anthropic, Google, open-source, etc.) — you send events to HFAI after your AI responds, keeping your data flow entirely under your control.",
  },
  {
    q: "What's the difference between Proxy and REST API?",
    a: "The Proxy intercepts AI traffic in real time — your requests flow through HFAI, giving full visibility into inputs and outputs with zero code changes. The REST API keeps your AI traffic private between you and your provider — only event metadata is sent to HFAI for monitoring. Choose Proxy for instant setup, REST API for maximum data control.",
  },
  {
    q: "What types of AI violations can HFAI detect?",
    a: "Content safety violations, bias detection, PII exposure, hallucination patterns, unauthorized data access, prompt injection attempts, and custom rules you define for your specific use case.",
  },
  {
    q: "Do I get automated compliance reports?",
    a: "Yes — HFAI generates and delivers a Weekly AI Governance Summary to your inbox every Monday. Each report includes your total AI systems, high-risk classifications, open and resolved violations, active governance rules, and human review activity. No manual work required — full EU AI Act compliance visibility on autopilot.",
  },
  {
    q: "What is Root Cause Analysis?",
    a: "Our AI-powered RCA engine diagnoses why violations occur, suggests rule changes, identifies recurring patterns, and generates remediation checklists — all validated by human reviewers.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All data is encrypted at rest and in transit. We follow SOC 2 aligned practices. With the REST API integration, your AI traffic never leaves your environment — only event metadata is sent to HFAI. With the Proxy, traffic is encrypted end-to-end and processed in real time.",
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
