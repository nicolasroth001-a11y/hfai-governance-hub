import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function ExitIntentCapture() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (e.clientY <= 5 && !dismissed && !show) {
        const alreadyShown = sessionStorage.getItem("hfai-exit-shown");
        if (!alreadyShown) {
          setShow(true);
          sessionStorage.setItem("hfai-exit-shown", "1");
        }
      }
    },
    [dismissed, show]
  );

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  const close = () => {
    setShow(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full max-w-md rounded-2xl border border-primary/30 bg-background shadow-2xl shadow-primary/10 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 h-7 w-7 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="h-7 w-7 text-primary" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground tracking-tight">
                  {t("exitIntent.title", { defaultValue: "Before you go — are you EU AI Act ready?" })}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {t("exitIntent.desc", { defaultValue: "Take our 2-minute readiness assessment. Get an instant compliance score and a personalized PDF report — completely free." })}
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full h-11 text-sm gap-2"
                  onClick={() => {
                    close();
                    navigate("/readiness-assessment");
                  }}
                >
                  <BarChart3 className="h-4 w-4" />
                  {t("exitIntent.cta", { defaultValue: "Check My Readiness — Free" })}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <button
                  onClick={close}
                  className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  {t("exitIntent.dismiss", { defaultValue: "No thanks, I'll risk it" })}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
