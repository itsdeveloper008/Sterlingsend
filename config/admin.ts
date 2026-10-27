/**
 * Emails allowed into /admin. Override with ADMIN_EMAILS (comma separated)
 * in the environment. Only verified sign-in emails are accepted.
 */
const DEFAULT_ADMIN_EMAILS = ["admin@onixs.ai", "itsalithedeveloper@gmail.com"];

export function getAdminEmails(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv?.length ? fromEnv : DEFAULT_ADMIN_EMAILS;
}
