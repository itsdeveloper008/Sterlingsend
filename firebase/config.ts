import { getClientEnv } from "@/config/env";

/**
 * Firebase Auth helper host (*.firebaseapp.com).
 * Used as the Next.js rewrite proxy target for /__/auth/*.
 * Keep this as the project’s firebaseapp.com domain in .env.
 */
export const firebaseAuthHelperHost =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "";

/**
 * Same-origin authDomain so Google popup/redirect can use first-party storage.
 * Requires next.config rewrite of /__/auth/* → firebaseAuthHelperHost.
 * @see https://firebase.google.com/docs/auth/web/redirect-best-practices
 */
export function resolveClientAuthDomain(): string {
  if (typeof window !== "undefined" && window.location.host) {
    return window.location.host;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      return new URL(appUrl).host;
    } catch {
      // fall through
    }
  }

  return firebaseAuthHelperHost;
}

export function getFirebaseClientConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: resolveClientAuthDomain(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

/** @deprecated Prefer getFirebaseClientConfig() — authDomain is dynamic. */
export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export function assertClientConfig() {
  if (typeof window === "undefined") return;

  const config = getFirebaseClientConfig();
  const required = Object.entries(config).filter(([, value]) => !value);

  if (required.length > 0) {
    console.warn(
      `[Valix] Missing Firebase client config keys: ${required.map(([k]) => k).join(", ")}`,
    );
  }

  try {
    getClientEnv();
  } catch {
    console.warn("[Valix] Client environment validation failed.");
  }
}
