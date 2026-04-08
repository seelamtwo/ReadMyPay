/** Normalize env to `https://host` (no path) for absolute links in emails. */
function siteOriginFromEnv(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  let s = raw.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }
  try {
    const u = new URL(s);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

/**
 * Base URL for links in emails (password reset, etc.). Must match the URL users open in the browser.
 * Order: NEXT_PUBLIC_APP_URL → NEXTAUTH_URL → Vercel production URL → deployment URL → localhost.
 */
export function getAppBaseUrl(): string {
  const fromExplicit =
    siteOriginFromEnv(process.env.NEXT_PUBLIC_APP_URL) ??
    siteOriginFromEnv(process.env.NEXTAUTH_URL) ??
    siteOriginFromEnv(process.env.VERCEL_PROJECT_PRODUCTION_URL);

  if (fromExplicit) return fromExplicit;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "");
    const origin = siteOriginFromEnv(host);
    if (origin) return origin;
  }

  return "http://localhost:3000";
}
