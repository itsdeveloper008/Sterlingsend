/**
 * Emails allowed into /admin. Override with ADMIN_EMAILS (comma separated)
 * in the environment. Only verified sign-in emails are accepted.
 */
const DEFAULT_ADMIN_EMAILS = ["info@sterlingsend.com"];

export function getAdminEmails(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv?.length ? fromEnv : DEFAULT_ADMIN_EMAILS;
}

/**
 * The admin panel has no public address: it is served only at a secret
 * /<32 hex chars> path. /admin itself always 404s. The path is ADMIN_PATH
 * when set, otherwise derived from the Firebase server key, which never
 * leaves the server. Works in middleware (Web Crypto) and in Node.
 */
export const ADMIN_PATH_PATTERN = /^[a-f0-9]{32}$/;

let derivedPath: Promise<string | null> | undefined;

export function getAdminPanelPath(): Promise<string | null> {
  const slug = process.env.ADMIN_PATH?.trim().toLowerCase();
  if (slug && ADMIN_PATH_PATTERN.test(slug)) return Promise.resolve(`/${slug}`);
  derivedPath ??= deriveAdminPath();
  return derivedPath;
}

async function deriveAdminPath(): Promise<string | null> {
  const secret = process.env.FIREBASE_PRIVATE_KEY;
  if (!secret) return null;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`sterlingsend-admin-path:${secret}`),
  );
  const hex = Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  return `/${hex.slice(0, 32)}`;
}
