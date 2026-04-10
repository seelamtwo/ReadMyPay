/**
 * Comma- or space-separated admin emails (server-only). Compared case-insensitively.
 * Example: ADMIN_EMAILS="somejeevam@gmail.com"
 */
export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseAdminAllowlist(): Set<string> {
  const raw = process.env.ADMIN_EMAILS?.trim() ?? "";
  if (!raw) return new Set();
  const parts = raw.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
  return new Set(parts.map((p) => normalizeAdminEmail(p)));
}

/** Parsed on each call so `ADMIN_EMAILS` updates apply without stale module cache. */
export function getAdminAllowlist(): Set<string> {
  return parseAdminAllowlist();
}

/** True if email is on ADMIN_EMAILS. Empty allowlist → no one is admin. */
export function emailIsAdmin(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  const allow = getAdminAllowlist();
  if (allow.size === 0) return false;
  return allow.has(normalizeAdminEmail(email));
}
