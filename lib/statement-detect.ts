/**
 * Heuristic gate for multi-file uploads: only bank/card-style statements allowed together.
 * Single-file uploads skip this (handled by the model returning empty transactions if irrelevant).
 */

const STRONG_TEXT = [
  /\b(beginning|opening)\s+balance\b/i,
  /\b(ending|closing)\s+balance\b/i,
  /\baccount\s+(summary|activity|history)\b/i,
  /\btransaction\s+(history|details?|date|description)\b/i,
  /\bstatement\s+(period|date|ending)\b/i,
  /\b(checking|savings)\s+account\b/i,
];

const MID_TEXT = [
  /\bwithdrawal\b/i,
  /\bdeposit\b/i,
  /\bposted\s+(date|transaction)\b/i,
  /\bdebit\s+(card|purchase|transaction)?\b/i,
  /\bcredit\s+card\b/i,
  /\bdaily\s+balance\b/i,
  /\bavailable\s+balance\b/i,
  /\bending\s+date\b/i,
];

const STRONG_NAME = [
  /statement/i,
  /spreadsheet|excel|\.xlsx|\.xlsm?/i,
  /bank/i,
  /checking/i,
  /savings/i,
  /credit[\s_-]?card/i,
  /visa/i,
  /mastercard/i,
  /amex|american\s*express/i,
  /discover/i,
  /account\s*activity/i,
  /transactions?/i,
];

export function isPlausibleBankOrCardStatement(
  filename: string,
  text: string | undefined
): boolean {
  const sample = (text ?? "").slice(0, 80_000);
  let score = 0;
  for (const re of STRONG_TEXT) {
    if (re.test(sample)) score += 3;
  }
  for (const re of MID_TEXT) {
    if (re.test(sample)) score += 1;
  }

  if (sample.length >= 400 && score >= 5) return true;
  if (sample.length >= 1200 && score >= 3) return true;

  const name = filename.toLowerCase();
  const nameHit = STRONG_NAME.some((re) => re.test(name));
  if (nameHit && sample.length >= 80 && score >= 2) return true;
  if (nameHit && sample.length === 0) return true;

  return false;
}

export const MULTI_NON_STATEMENT_MESSAGE =
  "Multiple files are only allowed when each one looks like a bank or card statement. Upload statements one at a time, or combine non-statement documents into a single file if needed.";
