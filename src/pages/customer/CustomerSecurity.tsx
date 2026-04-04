import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldOff, Loader2, QrCode, Trash2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { SectionHeader } from "@/components/SectionHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Factor = { id: string; friendly_name?: string; status: string };

export default function CustomerSecurity() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const loadFactors = async () => {
    setLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as Factor[]);
    setLoading(false);
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const handleEnroll = async () => {
    setEnrolling(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator App",
    });
    if (error) {
      toast({ title: "Enrollment failed", description: error.message, variant: "destructive" });
      setEnrolling(false);
      return;
    }
    setQrUri(data.totp.qr_code);
    setFactorId(data.id);
    setEnrolling(false);
  };

  const handleVerifyEnrollment = async () => {
    if (!factorId || verifyCode.length !== 6) return;
    setVerifying(true);
    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeErr) {
      toast({ title: "Challenge failed", description: challengeErr.message, variant: "destructive" });
      setVerifying(false);
      return;
    }
    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: verifyCode,
    });
    setVerifying(false);
    if (verifyErr) {
      toast({ title: "Invalid code", description: "Please try again.", variant: "destructive" });
      setVerifyCode("");
      return;
    }
    toast({ title: "MFA enabled!", description: "Two-factor authentication is now active on your account." });
    setQrUri(null);
    setFactorId(null);
    setVerifyCode("");
    loadFactors();
  };

  const handleUnenroll = async (fId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: fId });
    if (error) {
      toast({ title: "Failed to remove MFA", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "MFA disabled", description: "Two-factor authentication has been removed." });
    loadFactors();
  };

  useEffect(() => {
    if (verifyCode.length === 6 && factorId) handleVerifyEnrollment();
  }, [verifyCode]);

  const hasActiveFactor = factors.some((f) => f.status === "verified");

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Security Settings"
        description="Manage two-factor authentication for your account"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security using an authenticator app like Google Authenticator or Authy
              </CardDescription>
            </div>
            {hasActiveFactor ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                <ShieldOff className="h-3.5 w-3.5 mr-1" />
                Disabled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : qrUri ? (
            /* Enrollment flow */
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app, then enter the 6-digit code below:
                </p>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl inline-block">
                    <img src={qrUri} alt="TOTP QR Code" className="w-48 h-48" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <InputOTP maxLength={6} value={verifyCode} onChange={setVerifyCode} disabled={verifying}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQrUri(null);
                      setFactorId(null);
                      setVerifyCode("");
                    }}
                    disabled={verifying}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleVerifyEnrollment} disabled={verifying || verifyCode.length !== 6} className="gap-2">
                    {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verify & Enable
                  </Button>
                </div>
              </div>
            </div>
          ) : hasActiveFactor ? (
            /* Active factors list */
            <div className="space-y-4">
              {factors
                .filter((f) => f.status === "verified")
                .map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <QrCode className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{f.friendly_name || "Authenticator App"}</p>
                        <p className="text-xs text-muted-foreground">TOTP · Active</p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove MFA?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will disable two-factor authentication on your account. You can re-enable it later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleUnenroll(f.id)} className="bg-destructive text-destructive-foreground">
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
            </div>
          ) : (
            /* No factors — show setup button */
            <div className="text-center py-4">
              <Button onClick={handleEnroll} disabled={enrolling} className="gap-2">
                {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                Set Up Two-Factor Authentication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
