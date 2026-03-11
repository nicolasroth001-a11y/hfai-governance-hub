import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";

interface MFAChallengeProps {
  onVerified: () => void;
  onCancel: () => void;
}

export function MFAChallenge({ onVerified, onCancel }: MFAChallengeProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function startChallenge() {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (!totp) {
        toast({ title: "No MFA factor found", variant: "destructive" });
        onCancel();
        return;
      }
      setFactorId(totp.id);
      const { data: challenge, error } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (error) {
        toast({ title: "MFA challenge failed", description: error.message, variant: "destructive" });
        onCancel();
        return;
      }
      setChallengeId(challenge.id);
    }
    startChallenge();
  }, [onCancel]);

  const handleVerify = async () => {
    if (!factorId || !challengeId || code.length !== 6) return;
    setLoading(true);
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Invalid code", description: "Please try again.", variant: "destructive" });
      setCode("");
    } else {
      onVerified();
    }
  };

  useEffect(() => {
    if (code.length === 6) handleVerify();
  }, [code]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
          <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode} disabled={loading}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button className="flex-1 gap-2" onClick={handleVerify} disabled={loading || code.length !== 6}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
