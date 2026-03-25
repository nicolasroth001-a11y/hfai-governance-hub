import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_TO_TIER, type TierKey } from "@/lib/stripe-config";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "reviewer" | "customer";
  org_id: string | null;
}

export interface SubscriptionStatus {
  subscribed: boolean;
  onTrial: boolean;
  tier: TierKey | null;
  productId: string | null;
  subscriptionEnd: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscription: SubscriptionStatus;
  mfaRequired: boolean;
  refreshSubscription: () => Promise<void>;
  checkMFA: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; mfaRequired?: boolean }>;
  signup: (data: { email: string; password: string; name: string; company_name: string; signup_source?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const defaultSubscription: SubscriptionStatus = {
  subscribed: false,
  onTrial: false,
  tier: "free",
  productId: null,
  subscriptionEnd: null,
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  subscription: defaultSubscription,
  mfaRequired: false,
  refreshSubscription: async () => {},
  checkMFA: async () => false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus>(defaultSubscription);
  const [mfaRequired, setMfaRequired] = useState(false);

  const checkMFA = useCallback(async (): Promise<boolean> => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (data && data.nextLevel === "aal2" && data.currentLevel === "aal1") {
      setMfaRequired(true);
      return true;
    }
    setMfaRequired(false);
    return false;
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, name, role, org_id")
      .eq("id", userId)
      .single();
    if (error) {
      console.error("Failed to fetch profile:", error);
      setProfile(null);
    } else {
      setProfile(data as Profile);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error || data?.error) {
        return;
      }
      const productId = data.product_id ?? null;
      const tier = productId ? (PRODUCT_TO_TIER[productId] ?? "free") : "free";
      setSubscription({
        subscribed: data.subscribed ?? false,
        onTrial: data.on_trial ?? false,
        tier,
        productId,
        subscriptionEnd: data.subscription_end ?? null,
      });
    } catch {
      // Silently fall back to free tier
    }
  }, []);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          setTimeout(() => fetchProfile(newSession.user.id), 0);
          setTimeout(() => refreshSubscription(), 100);
        } else {
          setProfile(null);
          setSubscription(defaultSubscription);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
        refreshSubscription();
      }
      setIsLoading(false);
    });

    return () => authSub.unsubscribe();
  }, [fetchProfile, refreshSubscription]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(refreshSubscription, 60_000);
    return () => clearInterval(interval);
  }, [session, refreshSubscription]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    const needsMfa = await checkMFA();
    return { success: true, mfaRequired: needsMfa };
  }, [checkMFA]);

  const signup = useCallback(async (data: { email: string; password: string; name: string; company_name: string; signup_source?: string }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name || data.company_name,
          role: "customer",
          company_name: data.company_name,
          signup_source: data.signup_source || "direct",
          signup_timestamp: new Date().toISOString(),
        },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, error: error.message };

    // Send welcome email via transactional email system
    if (authData?.user) {
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "welcome",
          recipientEmail: data.email,
          idempotencyKey: `welcome-${authData.user.id}`,
          templateData: {
            name: data.name || data.company_name,
            companyName: data.company_name,
          },
        },
      }).catch((err) => console.error("Welcome email failed:", err));
    }

    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setSubscription(defaultSubscription);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isAuthenticated: !!session,
        isLoading,
        subscription,
        mfaRequired,
        refreshSubscription,
        checkMFA,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
