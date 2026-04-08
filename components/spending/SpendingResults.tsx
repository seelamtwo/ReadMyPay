"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { ParsedTransaction } from "@/types/spending";
import {
  SPENDING_CATEGORIES,
  isUncategorizedCategory,
} from "@/types/spending";
import { aggregateSpendingByCategory } from "@/lib/spending-aggregate";

const fmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const selectClass =
  "mt-1 block w-full max-w-xs rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500";

/** Slices smaller than this share of the pie skip outside labels (they overlap); use legend, tooltip, and table. */
const PIE_LABEL_MIN_PERCENT = 0.08;

function pieSliceLabel(props: {
  name?: string;
  percent?: number;
}): string | null {
  const p = props.percent ?? 0;
  if (p < PIE_LABEL_MIN_PERCENT) return null;
  return `${props.name ?? ""} (${(p * 100).toFixed(0)}%)`;
}

export function SpendingResults({
  transactions,
  overallSummary,
  onCategoryChange,
}: {
  transactions: ParsedTransaction[];
  overallSummary: string;
  onCategoryChange: (index: number, category: string) => void;
}) {
  const needsCategoryReview = useMemo(
    () => transactions.some((t) => isUncategorizedCategory(t.category)),
    [transactions]
  );

  const uncategorizedIndices = useMemo(() => {
    const ix: number[] = [];
    transactions.forEach((t, i) => {
      if (isUncategorizedCategory(t.category)) ix.push(i);
    });
    return ix;
  }, [transactions]);

  const byCategory = useMemo(
    () => aggregateSpendingByCategory(transactions),
    [transactions]
  );

  const chartData = useMemo(
    () =>
      byCategory.map((c) => ({
        name: c.category,
        value: c.total,
        color: c.color,
      })),
    [byCategory]
  );

  const totalSpend = useMemo(
    () => byCategory.reduce((s, c) => s + c.total, 0),
    [byCategory]
  );

  if (needsCategoryReview) {
    return (
      <div className="mt-8 space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950">
          <p className="font-medium">Categorize a few transactions</p>
          <p className="mt-2 text-amber-900/90">
            We could not confidently label {uncategorizedIndices.length}{" "}
            line
            {uncategorizedIndices.length === 1 ? "" : "s"}. Choose a category
            for each; when you are done, your summary and spending chart will
            appear below.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Description</th>
                <th className="px-3 py-2 font-semibold">Category</th>
                <th className="px-3 py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {uncategorizedIndices.map((i) => {
                const t = transactions[i]!;
                return (
                  <tr key={i} className="bg-amber-50/40">
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                      {t.date ?? "—"}
                    </td>
                    <td className="max-w-[240px] px-3 py-2 text-slate-800">
                      {t.description}
                    </td>
                    <td className="px-3 py-2">
                      <label className="sr-only" htmlFor={`cat-${i}`}>
                        Category for {t.description}
                      </label>
                      <select
                        id={`cat-${i}`}
                        className={selectClass}
                        value=""
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v) onCategoryChange(i, v);
                        }}
                      >
                        <option value="">Select category…</option>
                        {SPENDING_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-medium tabular-nums ${
                        t.amount < 0 ? "text-red-700" : "text-emerald-700"
                      }`}
                    >
                      {fmt.format(t.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {overallSummary ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Summary</p>
          <p className="mt-2 whitespace-pre-wrap">{overallSummary}</p>
        </div>
      ) : null}

      {chartData.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Spending by category
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Total debits analyzed: {fmt.format(totalSpend)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Hover any slice for amount and percentage; tiny slices have no
            on-chart label.
          </p>
          <div className="mt-3 h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={100}
                  paddingAngle={1}
                  label={pieSliceLabel}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, item) => {
                    if (typeof value !== "number") return "";
                    const total = chartData.reduce((s, d) => s + d.value, 0);
                    const pct =
                      total > 0
                        ? ((value / total) * 100).toFixed(1)
                        : "0";
                    const payload = item?.payload as { name?: string } | undefined;
                    const categoryLabel = payload?.name ?? "Category";
                    return [`${fmt.format(value)} (${pct}%)`, categoryLabel];
                  }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-2 font-semibold">Category</th>
                  <th className="px-4 py-2 font-semibold text-right">
                    Total spending
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byCategory.map((row) => (
                  <tr key={row.category}>
                    <td className="px-4 py-2">
                      <span
                        className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                        style={{ backgroundColor: row.color }}
                      />
                      {row.category}
                    </td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums">
                      {fmt.format(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          No debit transactions found to chart. If this should be a bank
          statement, try clearer exports or add more pages.
        </p>
      )}

      {transactions.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            All transactions ({transactions.length})
          </h3>
          <div className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
              <thead className="sticky top-0 bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Description</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-3 py-1.5 text-slate-600">
                      {t.date ?? "—"}
                    </td>
                    <td className="max-w-[220px] truncate px-3 py-1.5 text-slate-800">
                      {t.description}
                    </td>
                    <td className="px-3 py-1.5 text-slate-600">{t.category}</td>
                    <td
                      className={`px-3 py-1.5 text-right font-medium tabular-nums ${
                        t.amount < 0 ? "text-red-700" : "text-emerald-700"
                      }`}
                    >
                      {fmt.format(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
