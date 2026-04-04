import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, LogIn, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { MFAChallenge } from "@/components/MFAChallenge";
import { useTranslation } from "react-i18next";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMFA, setShowMFA] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      if (result.mfaRequired) {
        setShowMFA(true);
      } else {
        navigate("/customer/dashboard");
      }
    } else {
      toast({ title: t("auth.loginFailed"), description: result.error, variant: "destructive" });
    }
  };

  if (showMFA) {
    return (
      <MFAChallenge
        onVerified={() => navigate("/customer/dashboard")}
        onCancel={() => {
          setShowMFA(false);
          logout();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("auth.backToHome")}
        </Link>
      <Card className="w-full">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">{t("auth.customerPortal")}</CardTitle>
          <CardDescription>{t("auth.customerPortalDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">{t("auth.email")}</Label>
              <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-card border-card-foreground/10" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-card-foreground">{t("auth.password")}</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">{t("auth.forgotPassword")}</Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-card border-card-foreground/10" />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? t("auth.signingIn") : t("auth.logIn")}
            </Button>
          </form>
          <p className="text-center text-xs text-card-foreground/50">
            {t("auth.dontHaveAccount")}{" "}
            <Link to="/signup/customer" className="text-primary hover:underline">{t("auth.signUp")}</Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
