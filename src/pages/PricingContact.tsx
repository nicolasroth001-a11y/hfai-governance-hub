import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const valueBullets = [
  "Monitor AI behavior in real time",
  "Automatically detect violations",
  "Enforce safety and compliance rules",
  "Assign human reviewers for critical decisions",
  "Maintain audit logs for internal and external compliance",
  "Integrate in minutes with a single API key",
];

export default function PricingContact() {
  const [form, setForm] = useState({ name: "", company: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending to nicolasroth001@gmail.com
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", company: "", email: "", message: "" });
      toast({ title: "Message sent", description: "We'll get back to you shortly." });
    }, 800);
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
            Human‑First AI Governance for Modern Teams
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Real‑time oversight, rule enforcement, and human‑in‑the‑loop review for your AI systems.
          </p>
        </section>

        {/* Value bullets */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-w-2xl mx-auto">
          {valueBullets.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{b}</span>
            </div>
          ))}
        </section>

        {/* Divider */}
        <div className="h-px bg-accent/25 max-w-md mx-auto" />

        {/* Form section */}
        <section className="max-w-lg mx-auto space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Let's talk about your use case</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              HFAI is designed for teams building AI‑powered products who need visibility, safety, and accountability. Tell us a bit about your system and we'll help you get started.
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
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? "Sending…" : "Contact Sales"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-accent/20 mt-16 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HFAI — Human‑First AI Governance
      </footer>
    </div>
  );
}
