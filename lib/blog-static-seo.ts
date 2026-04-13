/**
 * Per-slug meta descriptions for static posts (when DB row has no seoDescription).
 * Aim for ~150–160 characters; unique copy for each URL.
 */
const STATIC_BLOG_SEO_DESCRIPTIONS: Record<string, string> = {
  "pay-stub-every-line-explained":
    "Learn what gross pay, net pay, federal withholding, FICA, state tax, 401(k), and YTD mean on your pay stub—and what to verify each pay period.",
  "what-is-w2-form-january":
    "Your W-2 explained box by box: wages in Box 1, withholding, Social Security and Medicare, Box 12 codes, and state lines—plus what to check before you file.",
  "is-it-safe-upload-financial-documents-online":
    "Is it safe to upload pay stubs or tax forms online? How browser-only processing and zero data retention reduce risk—and what to ask any financial app.",
  "what-is-1099-form-guide":
    "1099-NEC, 1099-SSA, 1099-R, 1099-INT, and 1099-DIV in plain English: what each form reports, why nothing was withheld, and how it affects your return.",
  "bank-statement-lines-explained":
    "How to read your bank statement: deposits, withdrawals, ACH, fees, pending vs posted—and how statements help you spot errors and spending patterns.",
  "social-security-statement-earnings-record":
    "Understand your Social Security statement: earnings record, benefit estimates, full retirement age, claiming at 62 vs 70, disability and survivor benefits.",
  "medicare-eob-explanation-of-benefits":
    "Medicare EOB vs bill: how to read a Medicare Summary Notice, deductibles, coinsurance, spot billing errors, and when to appeal a denied claim.",
  "pension-statement-retirement-benefit":
    "Pension statements decoded: accrued benefit vs 401(k), typical formulas, early retirement cuts, survivor options, and what vesting means for your payout.",
  "what-is-irs-notice-tax-letter":
    "IRS notice numbers explained: CP2000, CP14, deadlines, and how most letters are routine—not an audit. What to do first and where to get free help.",
  "dont-understand-document-without-bothering-anyone":
    "It’s normal not to understand pay stubs and tax mailings. How to get help safely, avoid scams, and use tools that don’t store your documents.",
};

export function staticBlogSeoDescription(slug: string): string | undefined {
  return STATIC_BLOG_SEO_DESCRIPTIONS[slug];
}
