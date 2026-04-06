import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";

const INCIDENTS = [
  {
    date: "Apr 2026",
    headline: "Iran threatens OpenAI's $30B Stargate data center",
    tag: "Geopolitical Risk",
  },
  {
    date: "Mar 2026",
    headline: "€35M fine issued under EU AI Act for unmonitored hiring AI",
    tag: "EU AI Act Fine",
  },
  {
    date: "Feb 2026",
    headline: "AI chatbot gives unauthorized medical advice — hospital liable",
    tag: "Liability",
  },
  {
    date: "Jan 2026",
    headline: "Colorado AI Act enforcement begins — first complaints filed",
    tag: "US Regulation",
  },
  {
    date: "Dec 2025",
    headline: "AI agent autonomously approves €2M loan — no human review",
    tag: "Oversight Failure",
  },
  {
    date: "Nov 2025",
    headline: "npm supply chain breach exposes AI pipeline credentials",
    tag: "Pipeline Risk",
  },
];

export function RiskTicker() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % INCIDENTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/20 bg-destructive/5">
        <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
        <div className="flex-1 overflow-hidden h-5 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center gap-2"
            >
              <span className="text-[10px] font-mono text-destructive/70 shrink-0">
                {INCIDENTS[current].date}
              </span>
              <span className="text-xs text-foreground/90 truncate">
                {INCIDENTS[current].headline}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium shrink-0 hidden sm:inline">
                {INCIDENTS[current].tag}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
