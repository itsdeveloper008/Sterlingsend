"use client";

import {
  getAuth,
  signInWithEmailAndPassword,
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
