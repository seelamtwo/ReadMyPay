/**
 * Curated internal links between posts (SEO + readers). Order is display order.
 */
const RELATED_BY_SLUG: Record<string, string[]> = {
  "pay-stub-every-line-explained": ["what-is-w2-form-january", "bank-statement-lines-explained"],
  "what-is-w2-form-january": [
    "what-is-1099-form-guide",
    "pay-stub-every-line-explained",
  ],
  "is-it-safe-upload-financial-documents-online": [
    "pay-stub-every-line-explained",
    "dont-understand-document-without-bothering-anyone",
  ],
  "what-is-1099-form-guide": [
    "what-is-w2-form-january",
    "what-is-irs-notice-tax-letter",
  ],
  "bank-statement-lines-explained": [
    "pay-stub-every-line-explained",
    "what-is-w2-form-january",
  ],
  "social-security-statement-earnings-record": [
    "medicare-eob-explanation-of-benefits",
    "pension-statement-retirement-benefit",
  ],
  "medicare-eob-explanation-of-benefits": [
    "social-security-statement-earnings-record",
    "pension-statement-retirement-benefit",
  ],
  "pension-statement-retirement-benefit": [
    "social-security-statement-earnings-record",
    "what-is-w2-form-january",
  ],
  "what-is-irs-notice-tax-letter": [
    "what-is-1099-form-guide",
    "what-is-w2-form-january",
  ],
  "dont-understand-document-without-bothering-anyone": [
    "pay-stub-every-line-explained",
    "is-it-safe-upload-financial-documents-online",
  ],
};

export function relatedSlugsFor(slug: string): string[] {
  return RELATED_BY_SLUG[slug] ?? [];
}
