import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_EMAILS } from "@/lib/constants";
import { withTimeout } from "@/lib/query-utils";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_INIT_TIMEOUT_MS = 8000;
const QUERY_TIMEOUT_MS = 8000;

const isAdminEmail = (email: string | undefined): boolean =>
  Boolean(email && ADMIN_EMAILS.some((item) => item.toLowerCase() === email.toLowerCase()));

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAdminRole = useCallback(async (user: User | null | undefined) => {
    if (!user?.id) {
      setIsAdmin(false);
      return;
    }

    if (isAdminEmail(user.email)) {
      setIsAdmin(true);
      return;
    }

    try {
      const { data, error } = await withTimeout(
        supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
        QUERY_TIMEOUT_MS,
        "Admin role check",
      );

      if (error) {
        console.error("Failed to load admin role", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(Boolean(data));
    } catch (error) {
      console.error("Failed to load admin role", error);
      setIsAdmin(false);
    }
  }, []);

  const refreshRole = useCallback(async () => {
    await loadAdminRole(session?.user ?? null);
  }, [loadAdminRole, session?.user]);

  useEffect(() => {
    let mounted = true;

    const finishLoading = () => {
      if (mounted) setLoading(false);
    };

    const timeoutId = window.setTimeout(finishLoading, AUTH_INIT_TIMEOUT_MS);

    const init = async () => {
      try {
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          QUERY_TIMEOUT_MS,
          "Auth session",
        );
        if (error) console.error("Failed to get session", error);
        if (!mounted) return;
        setSession(data.session ?? null);
        await loadAdminRole(data.session?.user ?? null);
      } catch (error) {
        console.error("Auth init failed", error);
        if (mounted) setSession(null);
      } finally {
        window.clearTimeout(timeoutId);
        finishLoading();
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void loadAdminRole(nextSession?.user ?? null);
      finishLoading();
    });

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [loadAdminRole]);

  const signOut = useCallback(async () => {
    setSession(null);
    setIsAdmin(false);
    setLoading(false);

    try {
      await withTimeout(
        supabase.auth.signOut({ scope: "local" }),
        QUERY_TIMEOUT_MS,
        "Sign out",
      );
    } catch (error) {
      console.error("Sign out failed", error);
      localStorage.removeItem(`sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`);
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAdmin,
      loading,
      signOut,
      refreshRole,
    }),
    [session, isAdmin, loading, signOut, refreshRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
