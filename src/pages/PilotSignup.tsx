import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, CheckCircle, Zap, Users, BarChart3, ArrowLeft, Check, Play, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { usePageView } from "@/hooks/usePageView";
import { trackFunnelEvent } from "@/lib/funnel";
import { supabase } from "@/integrations/supabase/client";
import { FullDemoExperience } from "@/components/landing/FullDemoExperience";

const pilotBenefits = [
  { icon: Zap, title: "Full Platform Access", description: "Proxy + REST API, unlimited AI systems, all governance features for 30 days." },
  { icon: Users, title: "Dedicated Onboarding", description: "Our team helps you integrate, configure rules, and train reviewers." },
  { icon: BarChart3, title: "Governance Report", description: "At the end, receive a full audit of your AI systems' compliance posture." },
  { icon: Shield, title: "Zero Risk", description: "No credit card required. No commitment. Cancel anytime." },
];

function QuickCapture() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleQuickCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      await supabase.from("page_views").insert({
        page: "/pilot/quick-capture",
        referrer: `${email}|${company}`,
      });
      trackFunnelEvent("pilot_quick_capture", { email, company });
      setSubmitted(true);
      toast({ title: "We'll be in touch!", description: "Check your inbox for next steps." });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 text-center">
          <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">Got it! We'll reach out within 24 hours.</p>
          <p className="text-xs text-muted-foreground mt-1">Or create a full account below for instant access.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Quick Interest</span>
        </div>
        <p className="text-sm text-foreground font-medium mb-1">Not ready to create an account?</p>
        <p className="text-xs text-muted-foreground mb-4">Drop your email and we'll send you a personalized compliance briefing.</p>
        <form onSubmit={handleQuickCapture} className="space-y-2.5">
          <Input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-9 text-sm" />
          <Input placeholder="Company name (optional)" value={company} onChange={e => setCompany(e.target.value)} className="h-9 text-sm" />
          <Button type="submit" size="sm" className="w-full gap-2" disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <>Get My Briefing <ArrowRight className="h-3.5 w-3.5" /></>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function PilotSignup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  usePageView("/pilot");
  const [form, setForm] = useState({ company_name: "", name: "", email: "", password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const passwordChecks = [
    { label: "At least 8 characters", valid: form.password.length >= 8 },
    { label: "Contains uppercase letter", valid: /[A-Z]/.test(form.password) },
    { label: "Contains number", valid: /\d/.test(form.password) },
    { label: "Passwords match", valid: form.password.length > 0 && form.password === form.confirm_password },
  ];

  const allValid = passwordChecks.every((c) => c.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) {
      toast({ title: "Please fix password issues", variant: "destructive" });
      return;
    }
    trackFunnelEvent("signup_started", { source: "pilot_signup_page" });
    setLoading(true);
    const result = await signup({
      email: form.email,
      password: form.password,
      name: form.name || form.company_name,
      company_name: form.company_name,
      signup_source: "pilot_signup_page",
    });
    setLoading(false);
    if (result.success) {
      trackFunnelEvent("signup_completed", { source: "pilot_signup_page", email: form.email });
      toast({
        title: "🎉 Pilot account created!",
        description: "Welcome to HFAI. Redirecting to your dashboard…",
      });
      setTimeout(() => navigate("/customer/dashboard"), 1500);
    } else {
      toast({ title: "Signup failed", description: result.error, variant: "destructive" });
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Shield className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">You're already signed in!</h1>
        <p className="text-muted-foreground mb-6">Head to your dashboard to start your pilot.</p>
        <Button size="lg" onClick={() => navigate("/customer/dashboard")}>
          Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Demo overlay */}
      {showDemo && <FullDemoExperience onClose={() => setShowDemo(false)} />}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground tracking-tight">HFAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setShowDemo(true)}>
              <Play className="h-3 w-3" /> Try Demo
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/")}>
              <ArrowLeft className="h-3 w-3" /> Back
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center px-6 pt-28 sm:pt-36 pb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">Free 30-Day Trial</p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl leading-[1.1]">
            Start Governing Your AI —
            <br />
            <span className="text-primary">In Under 2 Minutes</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Create your free account, connect your AI systems, and get full platform access — no credit card, no sales call.
          </p>
          <div className="mt-6">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowDemo(true)}>
              <Play className="h-3.5 w-3.5" /> See it in action first — no signup needed
            </Button>
          </div>
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

      {/* Quick Capture + Signup Form side by side on desktop */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          {/* Quick capture — low friction */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <QuickCapture />
          </motion.div>

          {/* Full signup form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-primary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-foreground mb-1">Create Your Pilot Account</h2>
                <p className="text-sm text-muted-foreground mb-6">Instant access — no waiting for approval.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input placeholder="Acme Corp" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Your Name</Label>
                      <Input placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Work Email</Label>
                    <Input type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" placeholder="••••••••" value={form.confirm_password} onChange={e => setForm({ ...form, confirm_password: e.target.value })} required />
                  </div>
                  {form.password.length > 0 && (
                    <div className="space-y-1.5 rounded-lg border border-border p-3">
                      {passwordChecks.map((c) => (
                        <div key={c.label} className="flex items-center gap-2 text-xs">
                          <Check className={`h-3.5 w-3.5 ${c.valid ? "text-primary" : "text-muted-foreground/30"}`} />
                          <span className={c.valid ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button type="submit" className="w-full gap-2" size="lg" disabled={loading || !allValid}>
                    {loading ? "Creating your account..." : "Start My Free Pilot"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center justify-center gap-4 pt-2">
                    {["No credit card", "Instant access", "Full support"].map(t => (
                      <span key={t} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-primary/70" /> {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login/customer" className="text-primary hover:underline">Log in</Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
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
