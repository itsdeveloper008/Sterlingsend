"use client";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
  type Auth,
} from "firebase/auth";
import { getFirebaseApp } from "./client";
import { isFirebaseConfigured } from "./is-configured";

let auth: Auth | undefined;
const googleProvider = new GoogleAuthProvider();

/** Where to send the user after Google redirect sign-in completes. */
export const AUTH_POST_LOGIN_KEY = "sterlingsend_auth_post_login";

export function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add Firebase keys to .env.local - see .env.example",
    );
  }

  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password,
  );
  return credential.user;
}

function authErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String(error.code);
  }
  return "";
}

/**
 * Google sign-in. Prefers popup (same-origin authDomain + /__/auth proxy).
 * Falls back to full-page redirect if the popup is blocked.
 */
export async function signInWithGoogle(): Promise<
  FirebaseUser | "redirecting"
> {
  googleProvider.setCustomParameters({ prompt: "select_account" });
  const firebaseAuth = getFirebaseAuth();

  try {
    const credential = await signInWithPopup(firebaseAuth, googleProvider);
    return credential.user;
  } catch (error) {
    if (authErrorCode(error) === "auth/popup-blocked") {
      await signInWithRedirect(firebaseAuth, googleProvider);
      return "redirecting";
    }
    throw error;
  }
}

/** Call once on app boot after returning from Google redirect. */
let redirectResultPromise: Promise<FirebaseUser | null> | null = null;

export async function completeGoogleRedirectSignIn() {
  if (!isFirebaseConfigured()) return null;
  // Share one promise so React Strict Mode double-mount doesn't consume twice.
  if (!redirectResultPromise) {
    redirectResultPromise = getRedirectResult(getFirebaseAuth()).then(
      (result) => result?.user ?? null,
    );
  }
  return redirectResultPromise;
}

export async function signUp(
  email: string,
  password: string,
  displayName?: string,
) {
  const credential = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password,
  );

  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }

  return credential.user;
}

export async function logOut() {
  await signOut(getFirebaseAuth());
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

export async function getIdToken(user: FirebaseUser, forceRefresh = false) {
  return user.getIdToken(forceRefresh);
}

export type { FirebaseUser };
