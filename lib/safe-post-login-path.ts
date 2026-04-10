/** Paths that must never be post-login redirects. */
const AUTH_FLOW_PATH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
] as const;

export function isAuthFlowPath(pathname: string): boolean {
  const p = pathname.split("?")[0] ?? pathname;
  return AUTH_FLOW_PATH_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`)
  );
}

/**
 * Returns a safe internal path for redirects after login or when sending
 * authenticated users away from auth pages. Open paths (e.g. `/contact`) are allowed.
 */
export function safePostLoginPath(
  raw: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!raw || typeof raw !== "string") return fallback;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  const pathOnly = t.split("?")[0] ?? t;
  if (isAuthFlowPath(pathOnly)) return fallback;
  return t;
}
