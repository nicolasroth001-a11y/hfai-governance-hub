import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type State = "idle" | "claiming" | "success" | "error" | "needs_auth";

export default function CustomerGuardClaim() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string>("");
  const token = params.get("token") || "";

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setState("error");
      setMessage("Missing device token. Open the Guard extension popup and click 'Claim dashboard' again.");
      return;
    }
    if (!user) {
      setState("needs_auth");
      return;
    }
    let cancelled = false;
    (async () => {
      setState("claiming");
      try {
        const { data, error } = await supabase.rpc("claim_guard_device", { _device_token: token });
        if (cancelled) return;
        if (error) throw error;
        setState("success");
        setMessage((data as { mode?: string })?.mode === "merged"
          ? "Linked to your existing workspace."
          : "Workspace claimed. Welcome to HFAI.");
        setTimeout(() => navigate("/customer/guard", { replace: true }), 1400);
      } catch (e: any) {
        if (cancelled) return;
        setState("error");
        setMessage(e?.message || "Could not claim this device.");
      }
    })();
    return () => { cancelled = true; };
  }, [token, user, authLoading, navigate]);

  return (
    <div className="max-w-xl mx-auto py-12">
      <Card className="rounded-[20px]">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5"
          >
            {state === "claiming" && <Loader2 className="h-6 w-6 text-primary animate-spin" />}
            {state === "success" && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
            {state === "error" && <AlertTriangle className="h-6 w-6 text-amber-500" />}
            {(state === "idle" || state === "needs_auth") && <Shield className="h-6 w-6 text-primary" />}
          </motion.div>

          {state === "needs_auth" && (
            <>
              <h1 className="text-2xl font-semibold tracking-tight mb-2">Claim your Guard dashboard</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Sign in or create a free HFAI account to claim the workspace your extension has been silently
                building. Your blocks, regulation breakdown and audit trail will all be waiting.
              </p>
              <div className="flex gap-2 justify-center">
                <Link to={`/login?redirect=/customer/guard/claim?token=${encodeURIComponent(token)}`}>
                  <Button size="lg">Sign in</Button>
                </Link>
                <Link to={`/signup?source=guard&redirect=/customer/guard/claim?token=${encodeURIComponent(token)}`}>
                  <Button size="lg" variant="outline">Create account</Button>
                </Link>
              </div>
            </>
          )}

          {state === "claiming" && (
            <>
              <h1 className="text-xl font-semibold mb-2">Linking your extension…</h1>
              <p className="text-sm text-muted-foreground">One second. Moving your Guard data into your workspace.</p>
            </>
          )}

          {state === "success" && (
            <>
              <h1 className="text-xl font-semibold mb-2">{message}</h1>
              <p className="text-sm text-muted-foreground">Taking you to your dashboard…</p>
            </>
          )}

          {state === "error" && (
            <>
              <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <Link to="/customer/guard"><Button variant="outline">Go to dashboard</Button></Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
