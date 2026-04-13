/**
 * Canonical site URL for SEO (metadataBase, sitemap, JSON-LD).
 * Set `NEXT_PUBLIC_APP_URL` in production (e.g. https://www.readmypay.com).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      /* fallthrough */
    }
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const SITE_NAME = "Read My Pay";

export const DEFAULT_DESCRIPTION =
  "Upload pay stubs, bank statements, or tax documents for plain-English explanations. Privacy-first—your files are not stored on our servers.";
