import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Sparkles, CreditCard, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { TierConfig, TierKey } from "@/lib/stripe-config";

interface PricingCardProps {
  tier: TierConfig;
  tierKey: TierKey;
  isAuthenticated: boolean;
  isCurrentPlan: boolean;
  subscription: {
    subscribed: boolean;
    onTrial: boolean;
    subscriptionEnd: string | null;
  };
  onManageSubscription: () => void;
}

export function PricingCard({ tier, tierKey, isAuthenticated, isCurrentPlan, subscription, onManageSubscription }: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: tier.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else throw new Error("No checkout URL returned");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not start checkout.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`rounded-[20px] relative overflow-hidden flex flex-col ${tier.highlighted ? "border-primary ring-2 ring-primary/20" : ""} ${isCurrentPlan ? "border-primary/50 ring-2 ring-primary/20" : ""}`}>
      {tier.highlighted && !isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
            Most Popular
          </Badge>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <Badge variant="default" className="bg-primary text-primary-foreground gap-1 text-xs">
            <CheckCircle className="h-3 w-3" /> Your Plan
          </Badge>
        </div>
      )}
      <CardContent className="p-6 md:p-8 space-y-5 flex flex-col flex-1">
        <div className="space-y-2">
          <h3 className="text-lg font-bold tracking-tight">{tier.name}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{tier.price === 0 ? "Free" : `$${tier.price}`}</span>
            {tier.price > 0 && <span className="text-muted-foreground text-sm">/{tier.interval}</span>}
          </div>
          {tier.trial_days > 0 && <p className="text-xs text-muted-foreground">{tier.trial_days}‑day free trial</p>}
          {tier.price === 0 && <p className="text-xs text-muted-foreground">No credit card required</p>}
        </div>

        <ul className="space-y-2.5 flex-1">
          {tier.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>

        <div className="pt-2">
          {isCurrentPlan ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                {subscription.onTrial ? "Trial active" : "Active"} 
                {subscription.subscriptionEnd && ` · Renews ${new Date(subscription.subscriptionEnd).toLocaleDateString()}`}
              </p>
              {tier.price > 0 && (
                <Button variant="outline" className="w-full text-sm" onClick={onManageSubscription}>
                  Manage Subscription
                </Button>
              )}
            </div>
          ) : tier.price === 0 ? (
            isAuthenticated ? (
              <Button variant="outline" className="w-full text-sm" disabled>
                <CheckCircle className="h-4 w-4 mr-1" /> Included
              </Button>
            ) : (
              <Link to="/signup/customer">
                <Button className="w-full gap-2 text-sm" variant="outline">
                  <CreditCard className="h-4 w-4" /> Get Started Free
                </Button>
              </Link>
            )
          ) : isAuthenticated ? (
            <Button
              className={`w-full gap-2 text-sm`}
              variant={tier.highlighted ? "default" : "outline"}
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Start Free Trial</>
              )}
            </Button>
          ) : (
            <Link to="/signup/customer">
              <Button className="w-full gap-2 text-sm" variant={tier.highlighted ? "default" : "outline"}>
                <CreditCard className="h-4 w-4" /> Sign Up
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
