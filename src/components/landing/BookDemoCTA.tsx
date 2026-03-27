import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CALENDLY_URL = "https://calendly.com"; // TODO: Replace with real Calendly link

export function BookDemoCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-2xl"
    >
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 sm:p-10 text-center">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          See HFAI in Your Environment
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Book a 30-minute walkthrough. We'll show you how HFAI maps to your AI stack 
          and compliance requirements — no pressure, no pitch.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
          <Button
            size="lg"
            className="text-base px-8 h-12 gap-2"
            onClick={() => window.open(CALENDLY_URL, "_blank", "noopener,noreferrer")}
          >
            <Calendar className="h-4 w-4" /> Book a Demo <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground/60">
          30 min · No commitment · Tailored to your use case
        </p>
      </div>
    </motion.div>
  );
}
