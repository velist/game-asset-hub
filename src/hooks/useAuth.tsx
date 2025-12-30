import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.error("Error checking admin role:", error);
      return false;
    }

    return !!data;
  };

  // Keep auth listener synchronous to avoid deadlocks in some privacy modes.
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      const result = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setIsLoading(false);
      });

      subscription = result.data.subscription;
    } catch (err) {
      console.error("Auth listener init error:", err);
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
    }

    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error("Initial session check error:", err);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Resolve admin role AFTER auth state has been set (no Supabase calls inside onAuthStateChange).
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        return;
      }

      try {
        const adminStatus = await checkAdminRole(user.id);
        if (!cancelled) setIsAdmin(adminStatus);
      } catch (err) {
        console.error("Admin role check error:", err);
        if (!cancelled) setIsAdmin(false);
      }
    };

    // Defer to next tick to avoid running during React render/event phases.
    const t = window.setTimeout(() => {
      run();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
