import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePageView } from "@/hooks/usePageView";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { HFAI_PRO } from "@/lib/stripe-config";
import { Shield, CheckCircle, ArrowLeft, Sparkles, CreditCard, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function PricingContact() {
  const [form, setForm] = useState({ name: "", company: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { isAuthenticated, subscription, refreshSubscription } = useAuth();
  const [searchParams] = useSearchParams();
  usePageView("/pricing/contact");

  // Handle checkout success redirect
  const checkoutStatus = searchParams.get("checkout");
  if (checkoutStatus === "success" && !subscription.subscribed) {
    refreshSubscription();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("contact", { body: form });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setForm({ name: "", company: "", email: "", message: "" });
      toast({ title: "Message sent", description: "We'll get back to you shortly." });
    } catch {
      toast({ title: "Error", description: "Could not send message. Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not start checkout.", variant: "destructive" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not open subscription management.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-accent/20 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">HFAI</span>
        </Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Human‑First AI Governance for Modern Teams — start with a 7‑day free trial, no credit card surprises.
          </p>
        </section>

        {/* Pricing Card */}
        <section className="max-w-md mx-auto">
          <Card className={`rounded-[20px] relative overflow-hidden ${subscription.subscribed ? "border-primary/50 ring-2 ring-primary/20" : ""}`}>
            {subscription.subscribed && (
              <div className="absolute top-4 right-4">
                <Badge variant="default" className="bg-primary text-primary-foreground gap-1">
                  <CheckCircle className="h-3 w-3" /> Your Plan
                </Badge>
              </div>
            )}
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight">{HFAI_PRO.name}</h2>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${HFAI_PRO.price}</span>
                  <span className="text-muted-foreground">/{HFAI_PRO.interval}</span>
                </div>
                <p className="text-sm text-muted-foreground">7‑day free trial included</p>
              </div>

              <ul className="space-y-3">
                {HFAI_PRO.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {subscription.subscribed ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    {subscription.onTrial ? "Trial active" : "Active subscription"} 
                    {subscription.subscriptionEnd && ` · Renews ${new Date(subscription.subscriptionEnd).toLocaleDateString()}`}
                  </p>
                  <Button variant="outline" className="w-full" onClick={handleManageSubscription}>
                    Manage Subscription
                  </Button>
                </div>
              ) : isAuthenticated ? (
                <Button className="w-full gap-2" size="lg" onClick={handleCheckout} disabled={checkoutLoading}>
                  {checkoutLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Starting checkout…</>
                  ) : (
                    <><CreditCard className="h-4 w-4" /> Start Free Trial</>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Link to="/signup/customer">
                    <Button className="w-full gap-2" size="lg">
                      <CreditCard className="h-4 w-4" /> Sign Up & Start Free Trial
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground text-center">
                    Already have an account? <Link to="/login/customer" className="text-primary hover:underline">Log in</Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Divider */}
        <div className="h-px bg-accent/25 max-w-md mx-auto" />

        {/* Contact Form */}
        <section className="max-w-lg mx-auto space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Questions? Let's talk</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Need a custom plan or have questions about HFAI? Reach out and we'll help you get started.
            </p>
          </div>

          <Card className="rounded-[20px]">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@acme.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your AI system and what you're looking for..." />
                </div>
                <Button type="submit" variant="outline" className="w-full" disabled={sending}>
                  {sending ? "Sending…" : "Contact Us"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-accent/20 mt-16 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HFAI — Human‑First AI Governance
      </footer>
    </div>
  );
}
