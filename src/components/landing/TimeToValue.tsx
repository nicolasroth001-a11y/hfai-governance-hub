import { motion } from "framer-motion";
import { CheckCircle, Clock, Zap, Shield, FileCheck, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CALENDLY_URL = "mailto:nicolasroth@hfa-i.org?subject=HFAI%20Demo%20Request&body=Hi%20Nicolas%2C%0A%0AI%27d%20like%20to%20book%20a%20demo%20of%20HFAI.%0A%0AName%3A%0ACompany%3A%0ARole%3A%0APreferred%20time%3A%0A";

const milestones = [
  { day: "Day 1", icon: Zap, title: "Connect Your AI", desc: "Proxy or API integration in under 5 minutes. Zero code changes needed." },
  { day: "Day 3", icon: Shield, title: "First Violations Detected", desc: "Automated rules flag policy violations. Your compliance score appears." },
  { day: "Day 7", icon: FileCheck, title: "Human Reviews Complete", desc: "Reviewers approve/reject flagged events. Audit trail builds automatically." },
  { day: "Day 14", icon: CheckCircle, title: "Audit-Ready", desc: "Full EU AI Act documentation, risk assessments, and compliance reports generated." },
];

export function TimeToValue() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-3xl"
    >
      <div className="text-center mb-10">
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
          Time to Value
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-2">
          Audit-Ready in 14 Days
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Not months. Not quarters. Two weeks from sign-up to your first compliance report.
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-primary/10 hidden sm:block" />

        <div className="space-y-6">
          {milestones.map((m, i) => (
            <motion.div
              key={m.day}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex gap-4 items-start"
            >
              <div className="relative shrink-0">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${i === milestones.length - 1 ? 'bg-primary text-primary-foreground' : 'bg-primary/10'}`}>
                  <m.icon className={`h-5 w-5 ${i === milestones.length - 1 ? '' : 'text-primary'}`} />
                </div>
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-primary font-bold">{m.day}</span>
                  {i === milestones.length - 1 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      ✓ Goal
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground mt-0.5">{m.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Average time to first compliance report: 3 days</span>
        </div>
        <div>
          <Button className="gap-2 text-sm" onClick={() => window.open(CALENDLY_URL, "_blank", "noopener,noreferrer")}>
            <Calendar className="h-4 w-4" /> Start Your 14-Day Sprint <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
