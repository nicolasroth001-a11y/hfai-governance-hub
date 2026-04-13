import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function StickyDemoCTA() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50"
      >
        <div className="relative rounded-2xl border border-primary/30 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/10 p-4 max-w-[260px]">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 h-5 w-5 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {t("stickyDemo.title", { defaultValue: "Are you EU AI Act ready?" })}
              </p>
              <p className="text-[10px] text-muted-foreground leading-snug">
                {t("stickyDemo.desc", { defaultValue: "2-min assessment. Instant score + free PDF report." })}
              </p>
              <Button
                size="sm"
                className="h-7 text-[11px] gap-1 w-full"
                onClick={() => navigate("/readiness-assessment")}
              >
                <BarChart3 className="h-3 w-3" /> Check Readiness <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
