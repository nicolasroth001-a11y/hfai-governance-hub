import { motion } from "framer-motion";
import { AlertTriangle, Clock, FileWarning, Gavel, ArrowDown } from "lucide-react";

const TIMELINE = [
  {
    icon: Clock,
    time: "Day 0",
    title: "Your AI chatbot gives unauthorized financial advice",
    detail: "No one notices. There's no monitoring, no audit trail, no governance layer.",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  {
    icon: FileWarning,
    time: "Day 14",
    title: "Customer files a complaint with the regulator",
    detail: "The regulator asks for your AI decision logs. You have nothing to show.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: AlertTriangle,
    time: "Day 30",
    title: "Formal investigation launched",
    detail: "Under EU AI Act Art. 72, you must demonstrate human oversight and risk management. You can't.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    icon: Gavel,
    time: "Day 90",
    title: "€15M fine + mandatory shutdown of AI system",
    detail: "Your competitors — the ones who had governance — keep operating. You don't.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
];

export function NightmareScenario() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase tracking-[0.2em] text-destructive font-semibold">
          What happens without governance
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-2">
          This is what non-compliance looks like
        </h2>
      </div>

      <div className="space-y-0">
        {TIMELINE.map((step, i) => (
          <motion.div
            key={step.time}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div className={`h-10 w-10 rounded-xl ${step.bgColor} flex items-center justify-center shrink-0`}>
                  <step.icon className={`h-5 w-5 ${step.color}`} />
                </div>
                {i < TIMELINE.length - 1 && (
                  <div className="w-px h-8 bg-border/40 my-1" />
                )}
              </div>
              <div className="pb-4">
                <span className="text-[10px] font-mono text-muted-foreground">{step.time}</span>
                <p className="text-sm font-semibold text-foreground mt-0.5">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.detail}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
