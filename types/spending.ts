/** Model uses this when a debit/credit line cannot be categorized confidently. */
export const UNCATEGORIZED_LABEL = "Uncategorized";

export function isUncategorizedCategory(category: string): boolean {
  const c = category.trim().toLowerCase();
  return (
    c === UNCATEGORIZED_LABEL.toLowerCase() ||
    c === "unknown" ||
    c === "needs review" ||
    c === "unclassified"
  );
}

/** Categories the model and UI use for spending breakdown (excluding uncategorized). */
export const SPENDING_CATEGORIES = [
  "Groceries",
  "Dining",
  "Transport",
  "Shopping",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Travel",
  "Subscriptions",
  "Fees",
  "Transfer",
  "Income",
  "Other",
] as const;

export type SpendingCategory = (typeof SPENDING_CATEGORIES)[number];

export type ParsedTransaction = {
  date: string | null;
  description: string;
  amount: number;
  category: string;
};

export type SpendingAnalysisResult = {
  transactions: ParsedTransaction[];
  overallSummary: string;
};

export type CategoryTotal = {
  category: string;
  total: number;
  color: string;
};
