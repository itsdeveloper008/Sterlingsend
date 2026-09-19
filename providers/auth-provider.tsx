"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { toast } from "sonner";
import {
  AUTH_POST_LOGIN_KEY,
  completeGoogleRedirectSignIn,
  getFirebaseAuth,
  getIdToken,
  logOut as firebaseLogOut,
  resetPassword,
  signIn,
  signInWithGoogle,
  signUp,
} from "@/firebase/auth";
import { isFirebaseConfigured } from "@/firebase/is-configured";
import { routes } from "@/config/routes";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-errors";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  /** Path after login, or "redirecting" while navigating to Google. */
  signInWithGoogle: () => Promise<string | null | "redirecting">;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function persistSession(user: User): Promise<string | null> {
  const idToken = await getIdToken(user, true);
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    credentials: "same-origin",
  });

  if (!response.ok) {
    let message = "Could not start your session. Please try again.";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) message = payload.error;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  let redirectTo: string | null = null;
  try {
    const payload = (await response.json()) as { redirectTo?: string };
    redirectTo = payload.redirectTo ?? null;
  } catch {
    redirectTo = null;
  }

  return redirectTo;
}

async function clearSession() {
  await fetch("/api/auth/session", { method: "DELETE" });
}

function readPostLoginDestination(fallback: string | null): string {
  try {
    const stored = sessionStorage.getItem(AUTH_POST_LOGIN_KEY);
    sessionStorage.removeItem(AUTH_POST_LOGIN_KEY);
    if (stored && stored.startsWith("/")) return stored;
  } catch {
    // ignore
  }
  return fallback ?? routes.home;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      try {
        const redirectedUser = await completeGoogleRedirectSignIn();
        if (cancelled) return;

        if (redirectedUser) {
          const sessionRedirect = await persistSession(redirectedUser);
          if (cancelled) return;
          setUser(redirectedUser);
          setLoading(false);
          toast.success("Welcome back");
          window.location.assign(readPostLoginDestination(sessionRedirect));
          return;
        }
      } catch (error) {
        console.error("[auth] google redirect completion failed", error);
        toast.error(
          getAuthErrorMessage(error, "Could not finish Google sign-in"),
        );
      }

      if (cancelled) return;

      unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured. Add keys to .env.local");
    }
    const nextUser = await signIn(email, password);
    const redirectTo = await persistSession(nextUser);
    setUser(nextUser);
    return redirectTo;
  }, []);

  const handleSignInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured. Add keys to .env.local");
    }
    const result = await signInWithGoogle();
    if (result === "redirecting") return "redirecting";
    const redirectTo = await persistSession(result);
    setUser(result);
    return redirectTo;
  }, []);

  const handleSignUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      if (!isFirebaseConfigured()) {
        throw new Error("Firebase is not configured. Add keys to .env.local");
      }
      const nextUser = await signUp(email, password, displayName);
      const redirectTo = await persistSession(nextUser);
      setUser(nextUser);
      return redirectTo;
    },
    [],
  );

  const handleSignOut = useCallback(async () => {
    await clearSession();
    await firebaseLogOut();
    setUser(null);
  }, []);

  const handleForgotPassword = useCallback(async (email: string) => {
    await resetPassword(email);
  }, []);

  const refreshSession = useCallback(async () => {
    if (!user) return;
    await persistSession(user);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn: handleSignIn,
      signInWithGoogle: handleSignInWithGoogle,
      signUp: handleSignUp,
      signOut: handleSignOut,
      forgotPassword: handleForgotPassword,
      refreshSession,
    }),
    [
      user,
      loading,
      handleSignIn,
      handleSignInWithGoogle,
      handleSignUp,
      handleSignOut,
      handleForgotPassword,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
