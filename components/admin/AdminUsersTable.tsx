"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminUserTableRow } from "@/lib/admin-users";

type Flash = { kind: "ok" | "err"; text: string } | null;

async function postRefund(
  body: Record<string, unknown>
): Promise<{ ok: boolean; text: string }> {
  const res = await fetch("/api/admin/refund", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    refundId?: string;
  };
  if (!res.ok) {
    return {
      ok: false,
      text:
        typeof data.error === "string" && data.error.trim()
          ? data.error.trim()
          : `Request failed (${res.status})`,
    };
  }
  return {
    ok: true,
    text: `Refund ${data.refundId ?? "created"}`,
  };
}

type RowState = AdminUserTableRow;

type BusyKey = string | null;

function shortId(id: string): string {
  return id.length <= 12 ? id : `${id.slice(0, 6)}…${id.slice(-4)}`;
}

export function AdminUsersTable({ initialUsers }: { initialUsers: AdminUserTableRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<RowState[]>(initialUsers);
  const [busy, setBusy] = useState<BusyKey>(null);
  const [flash, setFlash] = useState<Flash>(null);

  useEffect(() => {
    setRows(initialUsers);
  }, [initialUsers]);

  /** Per-user local form state */
  const [creditsN, setCreditsN] = useState<Record<string, string>>({});
  const [docsN, setDocsN] = useState<Record<string, string>>({});
  const [chargeId, setChargeId] = useState<Record<string, string>>({});
  const [refundUsd, setRefundUsd] = useState<Record<string, string>>({});

  function syncDocsInput(userId: string, value: number) {
    setDocsN((m) => ({ ...m, [userId]: String(value) }));
    setRows((prev) =>
      prev.map((r) =>
        r.id === userId ? { ...r, docsUsedThisMonth: value } : r
      )
    );
  }

  async function grantCredits(userId: string) {
    const raw = creditsN[userId] ?? "1";
    const credits = Number.parseInt(raw, 10);
    if (!Number.isFinite(credits) || credits < 1 || credits > 100) {
      setFlash({ kind: "err", text: "Credits must be 1–100." });
      return;
    }
    setFlash(null);
    setBusy(`grant:${userId}`);
    const res = await fetch("/api/admin/grant-prepaid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, credits }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      prepaidDocCredits?: number;
    };
    setBusy(null);
    if (!res.ok) {
      setFlash({
        kind: "err",
        text:
          typeof data.error === "string" && data.error.trim()
            ? data.error.trim()
            : `Request failed (${res.status})`,
      });
      return;
    }
    if (typeof data.prepaidDocCredits === "number") {
      setRows((prev) =>
        prev.map((r) =>
          r.id === userId ? { ...r, prepaidDocCredits: data.prepaidDocCredits! } : r
        )
      );
      setCreditsN((m) => ({ ...m, [userId]: "1" }));
      setFlash({
        kind: "ok",
        text: `Prepaid credits: ${data.prepaidDocCredits}`,
      });
    } else {
      setFlash({ kind: "ok", text: "Credits updated." });
    }
    router.refresh();
  }

  async function setDocsUsed(userId: string) {
    const raw = docsN[userId];
    const n = Number.parseInt(raw ?? "", 10);
    if (!Number.isFinite(n) || n < 0 || n > 10_000) {
      setFlash({ kind: "err", text: "Documents used must be 0–10000." });
      return;
    }
    setFlash(null);
    setBusy(`docs:${userId}`);
    const res = await fetch("/api/admin/set-docs-used", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, docsUsedThisMonth: n }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      docsUsedThisMonth?: number;
    };
    setBusy(null);
    if (!res.ok) {
      setFlash({
        kind: "err",
        text:
          typeof data.error === "string" && data.error.trim()
            ? data.error.trim()
            : `Request failed (${res.status})`,
      });
      return;
    }
    if (typeof data.docsUsedThisMonth === "number") {
      syncDocsInput(userId, data.docsUsedThisMonth);
      setFlash({
        kind: "ok",
        text: `Documents used: ${data.docsUsedThisMonth}`,
      });
    } else {
      setFlash({ kind: "ok", text: "Usage updated." });
    }
    router.refresh();
  }

  async function refund(userId: string) {
    const ch = (chargeId[userId] ?? "").trim();
    if (!ch.startsWith("ch_")) {
      setFlash({ kind: "err", text: "Charge id must start with ch_" });
      return;
    }
    const amtStr = (refundUsd[userId] ?? "").trim();
    let amountCents: number | undefined;
    if (amtStr) {
      const dollars = Number.parseFloat(amtStr);
      if (!Number.isFinite(dollars) || dollars <= 0) {
        setFlash({
          kind: "err",
          text: "Refund amount must be positive USD or leave blank for full refund.",
        });
        return;
      }
      amountCents = Math.round(dollars * 100);
    }
    setFlash(null);
    setBusy(`refund:${userId}`);
    const out = await postRefund({
      userId,
      chargeId: ch,
      ...(amountCents != null ? { amountCents } : {}),
    });
    setBusy(null);
    setFlash({ kind: out.ok ? "ok" : "err", text: out.text });
    if (out.ok) {
      setChargeId((m) => ({ ...m, [userId]: "" }));
      setRefundUsd((m) => ({ ...m, [userId]: "" }));
    }
    router.refresh();
  }

  return (
    <Card className="mt-8 border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">Users</CardTitle>
        <p className="text-sm font-normal text-slate-600">
          Monthly = paid subscription (PERSONAL tier).{" "}
          <span className="font-medium text-slate-800">Unverified</span> means
          the user must confirm email before using the app (credential signups).
          Actions use the same APIs as before; each change is logged in
          AdminAuditLog.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {flash ? (
          <p
            role="status"
            className={
              flash.kind === "ok"
                ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
                : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
            }
          >
            {flash.text}
          </p>
        ) : null}

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2 font-medium text-slate-900">Email</th>
                <th className="px-3 py-2 font-medium text-slate-900">
                  Email verified
                </th>
                <th className="px-3 py-2 font-medium text-slate-900">User id</th>
                <th className="px-3 py-2 font-medium text-slate-900">Plan</th>
                <th className="px-3 py-2 font-medium text-slate-900 tabular-nums">
                  Prepaid
                </th>
                <th className="px-3 py-2 font-medium text-slate-900 tabular-nums">
                  Docs used
                </th>
                <th className="min-w-[200px] px-3 py-2 font-medium text-slate-900">
                  Add credits
                </th>
                <th className="min-w-[200px] px-3 py-2 font-medium text-slate-900">
                  Set docs used
                </th>
                <th className="min-w-[280px] px-3 py-2 font-medium text-slate-900">
                  Refund charge
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const docsVal =
                  docsN[row.id] ?? String(row.docsUsedThisMonth);
                const disabled = busy !== null;

                return (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 align-top last:border-0"
                  >
                    <td className="max-w-[200px] break-words px-3 py-2 text-slate-800">
                      {row.email}
                      {row.name ? (
                        <span className="block text-xs text-slate-500">
                          {row.name}
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {row.emailVerification === "verified" ? (
                        <span
                          className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900"
                          title={
                            row.emailVerifiedAtIso
                              ? `Verified ${row.emailVerifiedAtIso}`
                              : "Verified"
                          }
                        >
                          Verified
                        </span>
                      ) : row.emailVerification === "unverified" ? (
                        <span
                          className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-950"
                          title="Must verify email before dashboard/API access"
                        >
                          Unverified
                        </span>
                      ) : (
                        <span
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                          title="OAuth or legacy account — no email link step"
                        >
                          N/A
                        </span>
                      )}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-600"
                      title={row.id}
                    >
                      {shortId(row.id)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          row.planLabel === "Monthly"
                            ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900"
                            : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                        }
                      >
                        {row.planLabel}
                      </span>
                    </td>
                    <td className="px-3 py-2 tabular-nums text-slate-800">
                      {row.prepaidDocCredits}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-slate-800">
                      {row.docsUsedThisMonth}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-end gap-2">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor={`credits-${row.id}`}
                            className="sr-only"
                          >
                            Credits to add
                          </Label>
                          <Input
                            id={`credits-${row.id}`}
                            type="number"
                            min={1}
                            max={100}
                            className="h-9 w-20"
                            value={
                              creditsN[row.id] !== undefined
                                ? creditsN[row.id]
                                : "1"
                            }
                            onChange={(e) =>
                              setCreditsN((m) => ({
                                ...m,
                                [row.id]: e.target.value,
                              }))
                            }
                            disabled={disabled}
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          disabled={disabled}
                          onClick={() => void grantCredits(row.id)}
                        >
                          {busy === `grant:${row.id}` ? "…" : "Add"}
                        </Button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-end gap-2">
                        <div className="space-y-0.5">
                          <Label htmlFor={`docs-${row.id}`} className="sr-only">
                            Documents used
                          </Label>
                          <Input
                            id={`docs-${row.id}`}
                            type="number"
                            min={0}
                            max={10000}
                            className="h-9 w-20"
                            value={docsVal}
                            onChange={(e) =>
                              setDocsN((m) => ({
                                ...m,
                                [row.id]: e.target.value,
                              }))
                            }
                            disabled={disabled}
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={disabled}
                          onClick={() => void setDocsUsed(row.id)}
                        >
                          {busy === `docs:${row.id}` ? "…" : "Set"}
                        </Button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {!row.canRefund ? (
                        <p className="text-xs text-slate-500">
                          No Stripe customer (pending only).
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Input
                            placeholder="ch_…"
                            className="h-9 font-mono text-xs"
                            value={chargeId[row.id] ?? ""}
                            onChange={(e) =>
                              setChargeId((m) => ({
                                ...m,
                                [row.id]: e.target.value,
                              }))
                            }
                            disabled={disabled}
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="USD (optional)"
                              className="h-9 w-28"
                              value={refundUsd[row.id] ?? ""}
                              onChange={(e) =>
                                setRefundUsd((m) => ({
                                  ...m,
                                  [row.id]: e.target.value,
                                }))
                              }
                              disabled={disabled}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-800 hover:bg-red-50"
                              disabled={disabled}
                              onClick={() => void refund(row.id)}
                            >
                              {busy === `refund:${row.id}` ? "…" : "Refund"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-slate-600">No users yet.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
