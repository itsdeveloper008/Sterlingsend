"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { isFirebaseConfigured } from "@/firebase/is-configured";
import { routes } from "@/config/routes";
import { needsBusinessProfile } from "@/actions/onboarding.actions";

const PROFILE_OK_KEY = "ss_profile_ok";
import {
  clearAuthHint,
  isAuthRoute,
  postLoginDestination,
  readAuthHint,
  safeRedirectPath,
  setAuthHint,
} from "@/lib/auth-hint";

/** Minimal user shape so public pages need no firebase/auth types. */
export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
};

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    options?: { admin?: boolean },
  ) => Promise<string | null>;
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

async function loadAuthApi() {
  return import("@/firebase/auth");
}

function asAuthUser(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
}): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    getIdToken: (force) => user.getIdToken(force),
  };
}

async function persistSession(
  user: AuthUser,
  options?: { admin?: boolean },
): Promise<string | null> {
  const idToken = await user.getIdToken(true);
  let acquisition: Record<string, string> | undefined;
  try {
    const { readConsent, readPersistedUtms } = await import("@/lib/consent");
    if (readConsent() === "accepted") {
      const utms = readPersistedUtms();
      if (Object.keys(utms).length > 0) {
        acquisition = utms as Record<string, string>;
      }
    }
  } catch {
    // ignore
  }
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, acquisition, admin: options?.admin }),
    credentials: "same-origin",
  });

  if (!response.ok) {
    let message = "Could not start your session. Please try again.";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) message = payload.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  setAuthHint();

  try {
    const payload = (await response.json()) as { redirectTo?: string };
    return payload.redirectTo ?? null;
  } catch {
    return null;
  }
}

/** A refused session (e.g. admin on the public login) must not leave Firebase signed in. */
async function persistSessionOrSignOut(
  authApi: Awaited<ReturnType<typeof loadAuthApi>>,
  user: AuthUser,
  options?: { admin?: boolean },
): Promise<string | null> {
  try {
    return await persistSession(user, options);
  } catch (error) {
    await authApi.logOut().catch(() => {});
    throw error;
  }
}

async function clearSession() {
  clearAuthHint();
  await fetch("/api/auth/session", { method: "DELETE" });
}

function readPostLoginDestination(
  authApi: Awaited<ReturnType<typeof loadAuthApi>>,
  fallback: string | null,
): string {
  try {
    const stored = sessionStorage.getItem(authApi.AUTH_POST_LOGIN_KEY);
    sessionStorage.removeItem(authApi.AUTH_POST_LOGIN_KEY);
    return postLoginDestination(safeRedirectPath(stored), fallback);
  } catch {
    // ignore
  }
  return postLoginDestination(null, fallback);
}

function shouldBootstrapFirebase() {
  if (typeof window === "undefined") return false;
  if (isAuthRoute(window.location.pathname)) return true;
  if (readAuthHint()) return true;
  // Google redirect return may land on any path without the hint yet
  if (window.location.search.includes("apiKey=") || window.location.hash.includes("auth")) {
    return true;
  }
  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    if (!shouldBootstrapFirebase()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let idleId: number | undefined;

    const boot = () => {
      void (async () => {
        const authApi = await loadAuthApi();
        if (cancelled) return;

        try {
          const redirectedUser = await authApi.completeGoogleRedirectSignIn();
          if (cancelled) return;

          if (redirectedUser) {
            const sessionRedirect = await persistSessionOrSignOut(
              authApi,
              asAuthUser(redirectedUser),
            );
            if (cancelled) return;
            setUser(asAuthUser(redirectedUser));
            setLoading(false);
            toast.success("Welcome back");
            window.location.assign(
              readPostLoginDestination(authApi, sessionRedirect),
            );
            return;
          }
        } catch (error) {
          console.error("[auth] google redirect completion failed", error);
          const { getAuthErrorMessage } = await import(
            "@/features/auth/lib/auth-errors"
          );
          toast.error(
            getAuthErrorMessage(error, "Could not finish Google sign-in"),
          );
        }

        if (cancelled) return;

        const { onAuthStateChanged } = await import("firebase/auth");
        unsubscribe = onAuthStateChanged(authApi.getFirebaseAuth(), (next) => {
          if (next) {
            setAuthHint();
            setUser(asAuthUser(next));
          } else {
            clearAuthHint();
            setUser(null);
          }
          setLoading(false);
        });
      })();
    };

    // Auth routes need Firebase immediately; elsewhere wait for idle
    if (isAuthRoute(window.location.pathname)) {
      boot();
    } else if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(boot, { timeout: 2500 });
    } else {
      idleId = window.setTimeout(boot, 400) as unknown as number;
    }

    return () => {
      cancelled = true;
      unsubscribe?.();
      if (idleId !== undefined) {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idleId);
        } else {
          window.clearTimeout(idleId);
        }
      }
    };
  }, []);

  // Signed-in accounts must finish their business details before using the
  // site; this catches sessions that predate the requirement.
  useEffect(() => {
    if (!user) return;
    const path = window.location.pathname;
    if (
      isAuthRoute(path) ||
      path.startsWith(routes.onboarding) ||
      path.startsWith(routes.admin)
    ) {
      return;
    }
    try {
      if (sessionStorage.getItem(PROFILE_OK_KEY) === user.uid) return;
    } catch {
      // ignore
    }
    let cancelled = false;
    void needsBusinessProfile()
      .then((needed) => {
        if (cancelled) return;
        if (needed) {
          window.location.assign(
            `${routes.onboarding}?redirect=${encodeURIComponent(path + window.location.search)}`,
          );
          return;
        }
        try {
          sessionStorage.setItem(PROFILE_OK_KEY, user.uid);
        } catch {
          // ignore
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSignIn = useCallback(
    async (email: string, password: string, options?: { admin?: boolean }) => {
      if (!isFirebaseConfigured()) {
        throw new Error("Firebase is not configured. Add keys to .env.local");
      }
      const authApi = await loadAuthApi();
      const nextUser = await authApi.signIn(email, password);
      const mapped = asAuthUser(nextUser);
      const redirectTo = await persistSessionOrSignOut(authApi, mapped, options);
      setUser(mapped);
      return redirectTo;
    },
    [],
  );

  const handleSignInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured. Add keys to .env.local");
    }
    const authApi = await loadAuthApi();
    const result = await authApi.signInWithGoogle();
    if (result === "redirecting") return "redirecting";
    const mapped = asAuthUser(result);
    const redirectTo = await persistSessionOrSignOut(authApi, mapped);
    setUser(mapped);
    return redirectTo;
  }, []);

  const handleSignUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      if (!isFirebaseConfigured()) {
        throw new Error("Firebase is not configured. Add keys to .env.local");
      }
      const authApi = await loadAuthApi();
      const nextUser = await authApi.signUp(email, password, displayName);
      const mapped = asAuthUser(nextUser);
      const redirectTo = await persistSession(mapped);
      setUser(mapped);
      return redirectTo;
    },
    [],
  );

  const handleSignOut = useCallback(async () => {
    await clearSession();
    if (isFirebaseConfigured()) {
      const authApi = await loadAuthApi();
      await authApi.logOut();
    }
    setUser(null);
  }, []);

  const handleForgotPassword = useCallback(async (email: string) => {
    const authApi = await loadAuthApi();
    await authApi.resetPassword(email);
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
