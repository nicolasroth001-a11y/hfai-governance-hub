import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock } from "lucide-react";

const GPAI_DEADLINE = new Date("2026-08-01T00:00:00Z");

function calcTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(GPAI_DEADLINE));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft(GPAI_DEADLINE)), 1000);
    return () => clearInterval(timer);
  }, []);

  const urgency = useMemo(() => {
    if (timeLeft.days < 180) return "critical";
    if (timeLeft.days < 365) return "warning";
    return "normal";
  }, [timeLeft.days]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-3xl"
    >
      <div className={`rounded-2xl border p-6 sm:p-8 text-center ${
        urgency === "critical"
          ? "border-destructive/40 bg-destructive/5"
          : urgency === "warning"
          ? "border-warning/40 bg-warning/5"
          : "border-primary/30 bg-primary/5"
      }`}>
        <div className="flex items-center justify-center gap-2 mb-4">
          {urgency === "critical" ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <Clock className="h-4 w-4 text-primary" />
          )}
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary">
            EU AI Act — GPAI Rules Deadline
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <TimeBlock value={timeLeft.days} label="Days" />
          <span className="text-xl font-bold text-muted-foreground/40 mt-[-12px]">:</span>
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <span className="text-xl font-bold text-muted-foreground/40 mt-[-12px]">:</span>
          <TimeBlock value={timeLeft.minutes} label="Min" />
          <span className="text-xl font-bold text-muted-foreground/40 mt-[-12px]">:</span>
          <TimeBlock value={timeLeft.seconds} label="Sec" />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          General-purpose AI model rules take effect <strong className="text-foreground">1 August 2026</strong>. 
          High-risk obligations follow December 2027.
        </p>
      </div>
    </motion.div>
  );
}
