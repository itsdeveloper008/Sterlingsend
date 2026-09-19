"use client";

import {
  initializeApp,
  getApps,
  type FirebaseApp,
} from "firebase/app";
import { getFirebaseClientConfig, assertClientConfig } from "./config";
import { isFirebaseConfigured } from "./is-configured";

let app: FirebaseApp | undefined;
let appAuthDomain: string | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK must only be used in the browser.");
  }

  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add Firebase keys to .env.local - see .env.example",
    );
  }

  const config = getFirebaseClientConfig();

  if (app && appAuthDomain === config.authDomain) {
    return app;
  }

  assertClientConfig();

  const matching = getApps().find(
    (existing) => existing.options.authDomain === config.authDomain,
  );
  if (matching) {
    app = matching;
    appAuthDomain = config.authDomain;
    return app;
  }

  app = getApps().some((existing) => existing.name === "[DEFAULT]")
    ? initializeApp(config, "sterlingsend")
    : initializeApp(config);
  appAuthDomain = config.authDomain;
  return app;
}
