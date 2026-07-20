"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { firebaseClientConfig, assertClientConfig } from "./config";
import { isFirebaseConfigured } from "./is-configured";

let app: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK must only be used in the browser.");
  }

  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add Firebase keys to .env.local - see .env.example",
    );
  }

  if (!app) {
    assertClientConfig();
    app = getApps().length ? getApp() : initializeApp(firebaseClientConfig);
  }

  return app;
}
