import { getClientEnv } from "@/config/env";

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

  const required = Object.entries(firebaseClientConfig).filter(
    ([, value]) => !value,
  );

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
