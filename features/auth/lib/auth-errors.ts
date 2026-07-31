import { FirebaseError } from "firebase/app";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "That email is already registered. Try logging in instead.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Password must be at least 8 characters.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/unauthorized-domain": "This domain is not authorized for Firebase Auth.",
  "auth/operation-not-allowed": "Email/password sign-in is disabled in Firebase.",
  "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
};

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
