import type { CategoryTotal, ParsedTransaction } from "@/types/spending";

/** Distinct colors for pie slices. */
export const CATEGORY_CHART_COLORS = [
  "#059669",
  "#0d9488",
  "#0891b2",
  "#2563eb",
  "#4f46e5",
  "#7c3aed",
  "#c026d3",
  "#db2777",
  "#ea580c",
  "#ca8a04",
  "#65a30d",
  "#16a34a",
  "#0f766e",
  "#0369a1",
  "#4338ca",
];

/** Sum debit amounts (negative) by category for a spending breakdown. */
export function aggregateSpendingByCategory(
  transactions: ParsedTransaction[]
): CategoryTotal[] {
  const map = new Map<string, number>();

  for (const t of transactions) {
    if (t.amount >= 0) continue;
    const cat = (t.category || "Other").trim() || "Other";
    map.set(cat, (map.get(cat) ?? 0) + Math.abs(t.amount));
  }

  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  return entries.map(([category, total], i) => ({
    category,
    total,
    color: CATEGORY_CHART_COLORS[i % CATEGORY_CHART_COLORS.length]!,
  }));
}
