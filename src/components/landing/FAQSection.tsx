import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

export function FAQSection() {
  const { t } = useTranslation();
  const faqs = t("faq.items", { returnObjects: true }) as { q: string; a: string }[];

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
