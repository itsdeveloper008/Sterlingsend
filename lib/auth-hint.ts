export const AUTH_HINT_COOKIE = "ss_auth";

export function readAuthHint(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((part) => part.trim() === `${AUTH_HINT_COOKIE}=1`);
}

export function setAuthHint() {
  if (typeof document === "undefined") return;
  // Non-sensitive presence hint only. Max-Age ~30 days.
  document.cookie = `${AUTH_HINT_COOKIE}=1; Path=/; Max-Age=2592000; SameSite=Lax`;
}

export function clearAuthHint() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_HINT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function isAuthRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password"
  );
}

/**
 * Post-login redirect target from the URL, or null. Only same-site paths:
 * "//host" and "/\\host" are protocol-relative to another site.
 */
export function safeRedirectPath(value: string | null | undefined) {
  if (!value || !/^\/(?![/\\])/.test(value)) return null;
  return value;
}
