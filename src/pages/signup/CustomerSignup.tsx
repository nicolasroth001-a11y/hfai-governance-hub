import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Check, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { trackFunnelEvent } from "@/lib/funnel";
import { useTranslation } from "react-i18next";

export default function CustomerSignup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({ company_name: "", name: "", email: "", password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: t("auth.passwordChecks.minLength"), valid: form.password.length >= 8 },
    { label: t("auth.passwordChecks.uppercase"), valid: /[A-Z]/.test(form.password) },
    { label: t("auth.passwordChecks.number"), valid: /\d/.test(form.password) },
    { label: t("auth.passwordChecks.match"), valid: form.password.length > 0 && form.password === form.confirm_password },
  ];

  const passwordStrong = passwordChecks.slice(0, 3).every((c) => c.valid);
  const allValid = passwordChecks.every((c) => c.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) {
      toast({ title: t("auth.fixPassword"), variant: "destructive" });
      return;
    }
    trackFunnelEvent("signup_started", { source: "customer_signup_page" });
    setLoading(true);
    const result = await signup({
      email: form.email,
      password: form.password,
      name: form.name || form.company_name,
      company_name: form.company_name,
      signup_source: "customer_signup_page",
    });
    setLoading(false);
    if (result.success) {
      trackFunnelEvent("signup_completed", { source: "customer_signup_page", email: form.email });
      toast({
        title: t("auth.accountCreated"),
        description: t("auth.accountCreatedDesc"),
      });
      setTimeout(() => navigate("/customer/dashboard"), 1500);
    } else {
      toast({ title: t("auth.signupFailed"), description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("auth.backToHome")}
        </Link>
      <Card className="w-full">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">{t("auth.createAccount")}</CardTitle>
          <CardDescription>{t("auth.createAccountDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("auth.companyName")}</Label>
              <Input placeholder="Acme Corp" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>{t("auth.yourName")}</Label>
              <Input placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("auth.email")}</Label>
              <Input type="email" placeholder="admin@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>{t("auth.password")}</Label>
              <Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>{t("auth.confirmPassword")}</Label>
              <Input type="password" placeholder="••••••••" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} required />
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
            <Button type="submit" className="w-full" disabled={loading || !allValid}>{loading ? t("auth.creating") : t("auth.createAccountBtn")}</Button>
            <p className="text-center text-xs text-card-foreground/50">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link to="/login/customer" className="text-primary hover:underline">{t("auth.logInLink")}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
