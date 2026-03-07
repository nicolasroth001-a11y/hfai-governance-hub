import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  refreshSubscription: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password: string; name: string; company_name: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const defaultSubscription: SubscriptionStatus = {
  subscribed: false,
  onTrial: false,
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
  refreshSubscription: async () => {},
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
        // Stripe not configured or user has no subscription — default to free tier silently
        return;
      }
      setSubscription({
        subscribed: data.subscribed ?? false,
        onTrial: data.on_trial ?? false,
        productId: data.product_id ?? null,
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

  // Auto-refresh subscription every 60s when logged in
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(refreshSubscription, 60_000);
    return () => clearInterval(interval);
  }, [session, refreshSubscription]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const signup = useCallback(async (data: { email: string; password: string; name: string; company_name: string }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name || data.company_name,
          role: "customer",
          company_name: data.company_name,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, error: error.message };
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
        refreshSubscription,
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
