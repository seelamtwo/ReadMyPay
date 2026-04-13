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

/** Site-wide default keywords (blog posts add their own via metadata). */
export const DEFAULT_SITE_KEYWORDS: string[] = [
  "pay stub explained",
  "W-2",
  "1099",
  "bank statement",
  "tax forms",
  "Social Security statement",
  "Medicare EOB",
  "pension statement",
  "IRS notice",
  "financial documents",
  "plain English",
  "privacy",
  "Read My Pay",
];
