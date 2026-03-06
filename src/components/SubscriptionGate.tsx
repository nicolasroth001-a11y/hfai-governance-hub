import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Sparkles, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HFAI_PRO } from "@/lib/stripe-config";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface SubscriptionGateProps {
  feature: string;
  children: React.ReactNode;
}

export function SubscriptionGate({ feature, children }: SubscriptionGateProps) {
  const { subscription, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  if (subscription.subscribed) {
    return <>{children}</>;
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not start checkout.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full rounded-[20px]">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">{feature} requires HFAI Pro</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upgrade to HFAI Pro for ${HFAI_PRO.price}/mo to unlock {feature.toLowerCase()}, plus all advanced governance features. Start with a free 7‑day trial.
            </p>
          </div>
          <div className="space-y-3">
            {isAuthenticated ? (
              <Button className="w-full gap-2" size="lg" onClick={handleCheckout} disabled={loading}>
                <Sparkles className="h-4 w-4" />
                {loading ? "Starting checkout…" : "Start Free Trial"}
              </Button>
            ) : (
              <Link to="/signup/customer">
                <Button className="w-full gap-2" size="lg">
                  <CreditCard className="h-4 w-4" /> Sign Up & Start Free Trial
                </Button>
              </Link>
            )}
            <Link to="/pricing/contact">
              <Button variant="ghost" className="w-full text-sm text-muted-foreground">
                View pricing details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
