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
 * The admin panel has no public address: it is served only at
 * /<ADMIN_PATH>, a 32-character hex secret kept in the environment.
 * /admin itself always 404s. Without a valid ADMIN_PATH the panel is off.
 */
export const ADMIN_PATH_PATTERN = /^[a-f0-9]{32}$/;

export function getAdminPanelPath(): string | null {
  const slug = process.env.ADMIN_PATH?.trim().toLowerCase();
  return slug && ADMIN_PATH_PATTERN.test(slug) ? `/${slug}` : null;
}
