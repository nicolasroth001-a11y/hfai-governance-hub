import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, CheckCircle, Zap, Users, BarChart3, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { usePageView } from "@/hooks/usePageView";

const pilotBenefits = [
  { icon: Zap, title: "Full Platform Access", description: "Proxy + REST API, unlimited AI systems, all governance features for 14 days." },
  { icon: Users, title: "Dedicated Onboarding", description: "Our team helps you integrate, configure rules, and train reviewers." },
  { icon: BarChart3, title: "Governance Report", description: "At the end, receive a full audit of your AI systems' compliance posture." },
  { icon: Shield, title: "Zero Risk", description: "No credit card required. No commitment. Cancel anytime." },
];

export default function PilotSignup() {
  const navigate = useNavigate();
  usePageView("/pilot");
  const [form, setForm] = useState({ name: "", company: "", email: "", ai_systems: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) {
      toast({ title: "Missing fields", description: "Please fill in your name, company, and email.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("contact", {
        body: { ...form, subject: "Pilot Program Request" },
      });
      if (error) throw error;
      toast({ title: "Application received!", description: "We'll be in touch within 24 hours to start your pilot." });
      setForm({ name: "", company: "", email: "", ai_systems: "", message: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground tracking-tight">HFAI</span>
          </Link>
          <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/")}>
            <ArrowLeft className="h-3 w-3" /> Back
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center px-6 pt-28 sm:pt-36 pb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">Free 14-Day Pilot</p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl leading-[1.1]">
            See AI Governance in Action —
            <br />
            <span className="text-primary">On Your Own Systems</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Connect your AI systems, configure governance rules, and get a full compliance report — all in 14 days, completely free.
          </p>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-4xl grid gap-4 sm:grid-cols-2">
          {pilotBenefits.map((b, i) => (
            <motion.div key={b.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border border-border/40 bg-secondary/20 h-full">
                <CardContent className="p-5 flex gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{b.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{b.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="px-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="mx-auto max-w-lg border-primary/20">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-foreground mb-1">Apply for the Pilot Program</h2>
              <p className="text-sm text-muted-foreground mb-6">We'll get back to you within 24 hours.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  <Input placeholder="Company name" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required />
                </div>
                <Input type="email" placeholder="Work email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                <Input placeholder="How many AI systems do you manage? (e.g. 3)" value={form.ai_systems} onChange={e => setForm({ ...form, ai_systems: e.target.value })} />
                <Textarea placeholder="Tell us about your AI governance needs (optional)" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} />
                <Button type="submit" className="w-full gap-2" disabled={sending}>
                  {sending ? "Sending..." : "Start My Free Pilot"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center gap-4 pt-2">
                  {["No credit card", "14-day access", "Full support"].map(t => (
                    <span key={t} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-primary/70" /> {t}
                    </span>
                  ))}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-6 mt-auto">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">HFAI</span>
          </div>
          <p className="text-[11px] text-muted-foreground/40">© {new Date().getFullYear()} HFAI — All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
