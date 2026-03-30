import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePageView } from "@/hooks/usePageView";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TIERS, type TierKey } from "@/lib/stripe-config";
import { Shield, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { PricingCard } from "@/components/pricing/PricingCard";

export default function PricingContact() {
  const [form, setForm] = useState({ name: "", company: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const { isAuthenticated, subscription, refreshSubscription } = useAuth();
  const [searchParams] = useSearchParams();
  usePageView("/pricing/contact");

  const checkoutStatus = searchParams.get("checkout");
  useEffect(() => {
    if (checkoutStatus === "success" && !subscription.subscribed) {
      refreshSubscription();
    }
  }, [checkoutStatus, subscription.subscribed, refreshSubscription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const id = crypto.randomUUID();
      // Send inquiry notification to admin
      const { error: inquiryError } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contact-inquiry",
          recipientEmail: form.email,
          idempotencyKey: `contact-inquiry-${id}`,
          templateData: { name: form.name, company: form.company, email: form.email, message: form.message },
        },
      });
      if (inquiryError) throw inquiryError;
      // Send confirmation to the person who contacted
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contact-confirmation",
          recipientEmail: form.email,
          idempotencyKey: `contact-confirm-${id}`,
          templateData: { name: form.name },
        },
      });
      setForm({ name: "", company: "", email: "", message: "" });
      toast({ title: "Message sent", description: "We'll get back to you shortly." });
    } catch {
      toast({ title: "Error", description: "Could not send message. Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not open subscription management.", variant: "destructive" });
    }
  };

  const tierKeys: TierKey[] = ["free", "starter", "pro", "enterprise", "sovereign"];

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            Human‑First AI Governance for teams of every size. Start with a 30‑day free trial on any paid plan.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {tierKeys.map((key) => (
            <PricingCard
              key={key}
              tier={TIERS[key]}
              tierKey={key}
              isAuthenticated={isAuthenticated}
              isCurrentPlan={subscription.subscribed && subscription.tier === key}
              subscription={subscription}
              onManageSubscription={handleManageSubscription}
            />
          ))}
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
