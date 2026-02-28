import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface AuthUser {
  id: number;
  email: string;
  role: "admin" | "reviewer" | "customer";
  name: string;
  org_id: number | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password: string; name: string; company_name: string }) => Promise<{ success: boolean; error?: string; api_key?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
});

const API_BASE = "http://localhost:4000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("hfai_token");
    const savedUser = localStorage.getItem("hfai_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("hfai_token");
        localStorage.removeItem("hfai_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Login failed" };

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("hfai_token", data.token);
      localStorage.setItem("hfai_user", JSON.stringify(data.user));
      return { success: true };
    } catch {
      return { success: false, error: "Cannot connect to server" };
    }
  }, []);

  const signup = useCallback(async (data: { email: string; password: string; name: string; company_name: string }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Signup failed" };

      setToken(result.token);
      setUser(result.user);
      localStorage.setItem("hfai_token", result.token);
      localStorage.setItem("hfai_user", JSON.stringify(result.user));
      return { success: true, api_key: result.organization?.api_key };
    } catch {
      return { success: false, error: "Cannot connect to server" };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("hfai_token");
    localStorage.removeItem("hfai_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
