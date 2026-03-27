import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@") || !gdprConsent) return;

    setLoading(true);
    try {
      await supabase.from("page_views").insert({
        page: "/newsletter-signup",
        referrer: email,
      });

      setSubmitted(true);
      toast({
        title: "You're subscribed!",
        description: "You'll receive AI governance insights and regulatory updates.",
      });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-2xl"
    >
      <div className="rounded-2xl border border-border/40 bg-secondary/10 p-6 sm:p-8 text-center">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Stay Ahead of AI Regulation
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-5">
                Monthly insights on EU AI Act, NIST AI RMF, and practical governance strategies.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3 max-w-sm mx-auto">
                <Input
                  type="email"
                  placeholder="work@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 text-sm"
                  required
                />
                <div className="flex items-start gap-2 text-left">
                  <Checkbox
                    id="gdpr-consent"
                    checked={gdprConsent}
                    onCheckedChange={(checked) => setGdprConsent(checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="gdpr-consent" className="text-[11px] text-muted-foreground leading-snug cursor-pointer">
                    I agree to receive AI governance updates from HFAI. You can unsubscribe at any time. 
                    We process your data in accordance with GDPR.
                  </label>
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading || !gdprConsent}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Subscribe <ArrowRight className="h-3.5 w-3.5" /></>
                  )}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4"
            >
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground">You're in!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Watch your inbox for AI governance insights.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
