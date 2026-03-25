import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, CheckCircle, Zap, Users, BarChart3, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
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
  const { signup, isAuthenticated } = useAuth();
  usePageView("/pilot");
  const [form, setForm] = useState({ company_name: "", name: "", email: "", password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    const result = await signup({
      email: form.email,
      password: form.password,
      name: form.name || form.company_name,
      company_name: form.company_name,
    });
    setLoading(false);
    if (result.success) {
      toast({
        title: "🎉 Pilot account created!",
        description: "Welcome to HFAI. Redirecting to your dashboard…",
      });
      setTimeout(() => navigate("/customer/dashboard"), 1500);
    } else {
      toast({ title: "Signup failed", description: result.error, variant: "destructive" });
    }
  };

  // If already logged in, redirect to dashboard
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
            Start Governing Your AI —
            <br />
            <span className="text-primary">In Under 2 Minutes</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Create your free account, connect your AI systems, and get full platform access — no credit card, no sales call.
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

      {/* Signup Form */}
      <section className="px-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="mx-auto max-w-lg border-primary/20">
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
