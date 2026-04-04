import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function LeadCapture() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const checklistItems = t("leadCapture.items", { returnObjects: true }) as string[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setLoading(true);
    try {
      await supabase.from("page_views").insert({ page: "/lead-capture/compliance-checklist", referrer: email });
      const idempotencyKey = `checklist-${email}-${Date.now()}`;
      await supabase.functions.invoke("send-transactional-email", {
        body: { templateName: "compliance-checklist", recipientEmail: email, idempotencyKey, templateData: { email } },
      });
      setSubmitted(true);
      toast({ title: t("leadCapture.toastTitle"), description: t("leadCapture.toastDesc") });
    } catch {
      toast({ title: t("common.errorTitle"), description: t("common.errorDesc"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold">{t("leadCapture.badge")}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">{t("leadCapture.title")}</h3>
                  <p className="text-sm text-foreground/70 mt-2 mb-4 leading-relaxed">{t("leadCapture.desc")}</p>
                  <ul className="space-y-2">
                    {checklistItems.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="sm:w-64 flex flex-col justify-center">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input type="email" placeholder="work@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 text-sm" required />
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("leadCapture.cta")} <ArrowRight className="h-3.5 w-3.5" /></>}
                    </Button>
                    <p className="text-[10px] text-muted-foreground/60 text-center">{t("leadCapture.noSpam")}</p>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{t("leadCapture.successTitle")}</h3>
                <p className="text-sm text-muted-foreground mt-1"
                  dangerouslySetInnerHTML={{ __html: t("leadCapture.successDesc", { email }).replace(/<1>(.*?)<\/1>/g, '<strong>$1</strong>') }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
