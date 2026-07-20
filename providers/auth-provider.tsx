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
import {
  getFirebaseAuth,
  getIdToken,
  logOut as firebaseLogOut,
  resetPassword,
  signIn,
  signUp,
} from "@/firebase/auth";
import { isFirebaseConfigured } from "@/firebase/is-configured";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function persistSession(user: User) {
  const idToken = await getIdToken(user, true);
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

async function clearSession() {
  await fetch("/api/auth/session", { method: "DELETE" });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured. Add keys to .env.local");
    }
    const nextUser = await signIn(email, password);
    await persistSession(nextUser);
    setUser(nextUser);
  }, []);

  const handleSignUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      if (!isFirebaseConfigured()) {
        throw new Error("Firebase is not configured. Add keys to .env.local");
      }
      const nextUser = await signUp(email, password, displayName);
      await persistSession(nextUser);
      setUser(nextUser);
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
      signUp: handleSignUp,
      signOut: handleSignOut,
      forgotPassword: handleForgotPassword,
      refreshSession,
    }),
    [
      user,
      loading,
      handleSignIn,
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
