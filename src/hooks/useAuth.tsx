import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
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

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      const result = supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
          setUser(session?.user ?? null);

          if (session?.user) {
            const adminStatus = await checkAdminRole(session.user.id);
            setIsAdmin(adminStatus);
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          // In some privacy/incognito contexts, storage access can fail.
          console.error("Auth state change handler error:", err);
          setUser(null);
          setIsAdmin(false);
        } finally {
          setIsLoading(false);
        }
      });

      subscription = result.data.subscription;
    } catch (err) {
      console.error("Auth listener init error:", err);
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
    }

    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        setUser(session?.user ?? null);

        if (session?.user) {
          const adminStatus = await checkAdminRole(session.user.id);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Initial session check error:", err);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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
    <AuthContext.Provider value={{ user, isAdmin, isLoading, signIn, signUp, signOut }}>
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
