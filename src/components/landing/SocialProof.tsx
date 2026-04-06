import { motion } from "framer-motion";
import { Shield, Clock, FileCheck, Users } from "lucide-react";

const metrics = [
  { icon: Users, value: "12+", label: "Pilot companies onboarded" },
  { icon: Clock, value: "< 2 min", label: "Average setup time" },
  { icon: FileCheck, value: "4,200+", label: "AI decisions audited" },
  { icon: Shield, value: "100%", label: "Audit trail coverage" },
];

export function SocialProof() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-3xl"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border/30 bg-secondary/10 px-4 py-5 text-center"
          >
            <m.icon className="h-4 w-4 text-primary/70" />
            <span className="text-xl font-bold text-foreground tracking-tight">{m.value}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{m.label}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-muted-foreground/50 mt-3">
        Metrics from active pilot programs • Updated April 2026
      </p>
    </motion.div>
  );
}
