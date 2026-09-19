import { FirebaseError } from "firebase/app";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "That email is already registered. Try logging in instead.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Password must be at least 8 characters.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/unauthorized-domain": "This domain is not authorized for Firebase Auth.",
  "auth/operation-not-allowed":
    "That sign-in method is disabled in Firebase. Enable Google in Authentication → Sign-in method.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/cancelled-popup-request": "Google sign-in was cancelled.",
  "auth/popup-blocked": "Allow popups for this site to continue with Google.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
  "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
};

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof FirebaseError) {
    if (error.code === "auth/unauthorized-domain") {
      const host =
        typeof window !== "undefined" ? window.location.hostname : "this site";
      return `Add “${host}” in Firebase → Authentication → Settings → Authorized domains, then try again.`;
    }
    return AUTH_ERROR_MESSAGES[error.code] ?? fallback;
  }

  if (error instanceof Error && error.message) {
    const message = error.message;
    if (
      message.includes("redirect_uri_mismatch") ||
      message.includes("invalid_request")
    ) {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "your site";
      return `Add ${origin}/__/auth/handler as an Authorized redirect URI on the Firebase Google OAuth client (Google Cloud Console → Credentials), then try again.`;
    }
    return message;
  }

  return fallback;
}
