import "server-only";

import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { getServerEnv } from "@/config/env";
import { isAdminConfigured } from "./is-admin-configured";

/*
 * Cached on globalThis: dev hot-reload swaps module instances while the
 * underlying Firebase app survives, and Firestore.settings() may only be
 * called once per instance.
 */
type AdminCache = {
  app?: App;
  auth?: Auth;
  db?: Firestore;
  storage?: Storage;
};

const globalForAdmin = globalThis as typeof globalThis & {
  __sterlingsendAdmin?: AdminCache;
};

const cache: AdminCache = (globalForAdmin.__sterlingsendAdmin ??= {});

function assertAdminConfigured() {
  if (!isAdminConfigured()) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    );
  }
}

function createAdminApp(): App {
  assertAdminConfigured();
  const env = getServerEnv();

  return getApps().length
    ? getApps()[0]!
    : initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
}

export function getAdminApp(): App {
  cache.app ??= createAdminApp();
  return cache.app;
}

export function getAdminAuth(): Auth {
  cache.auth ??= getAuth(getAdminApp());
  return cache.auth;
}

export function getAdminDb(): Firestore {
  if (!cache.db) {
    const db = getFirestore(getAdminApp());
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {
      // Already initialized by a previous module instance; existing settings apply.
    }
    cache.db = db;
  }
  return cache.db;
}

export function getAdminStorage(): Storage {
  cache.storage ??= getStorage(getAdminApp());
  return cache.storage;
}
