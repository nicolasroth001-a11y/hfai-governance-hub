import { motion } from "framer-motion";
import { User, Quote } from "lucide-react";

export function FounderSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-3xl"
    >
      <div className="rounded-2xl border border-border/40 bg-secondary/10 p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar / initials */}
          <div className="shrink-0">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">NR</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
              <Quote className="h-4 w-4 text-primary/50 rotate-180" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
                From the Founder
              </span>
            </div>

            <blockquote className="text-sm sm:text-base text-foreground/90 leading-relaxed italic">
              "I founded HFAI after seeing a gap between what organizations say about AI governance 
              and what actually happens at the moment of decision. My work focuses on designing practical, 
              human‑first governance systems that help teams understand, monitor, and control AI in real time."
            </blockquote>

            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              He brings a hands‑on, operational approach to one of the hardest problems in the field: 
              building accountability without creating surveillance.
            </p>

            <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Nicolas Roth</p>
                <p className="text-[11px] text-muted-foreground">Founder, HFAI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
