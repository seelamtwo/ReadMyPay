"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PRESETS = [7, 14, 30, 60, 90] as const;

export function AdminCleanupUnverifiedPanel() {
  const router = useRouter();
  const [days, setDays] = useState("30");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function runCleanup() {
    setError(null);
    setResult(null);
    const n = Number.parseInt(days, 10);
    if (!Number.isFinite(n) || n < 1 || n > 3650) {
      setError("Enter a number of days between 1 and 3650.");
      return;
    }
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setError('Type DELETE in the confirmation box to proceed.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/cleanup-unverified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ olderThanDays: n }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        deleted?: number;
        olderThanDays?: number;
        cutoffIso?: string;
        previewCount?: number;
      };
      if (!res.ok) {
        setError(
          typeof data.error === "string" && data.error.trim()
            ? data.error.trim()
            : `Request failed (${res.status})`
        );
        return;
      }
      const deleted = typeof data.deleted === "number" ? data.deleted : 0;
      const prev = data.previewCount;
      setConfirmText("");
      setResult(
        `Removed ${deleted} unverified account(s) (created before ${data.cutoffIso ?? "cutoff"}, i.e. more than ${data.olderThanDays ?? n} days ago).` +
          (typeof prev === "number" && prev !== deleted
            ? ` (${prev} matched the preview; difference means someone verified between preview and delete.)`
            : "")
      );
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Request failed."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-6 border-amber-200 bg-amber-50/40">
      <CardHeader>
        <CardTitle className="text-base text-amber-950">
          Clean up stale unverified accounts
        </CardTitle>
        <p className="text-sm font-normal text-amber-950/90">
          Permanently deletes users who signed up with email/password, never
          verified, and whose account was created <strong>more than</strong> the
          number of days you choose below. OAuth-only accounts are not
          affected. This is logged in AdminAuditLog.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-800">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cleanup-days">Older than (days)</Label>
            <Input
              id="cleanup-days"
              type="number"
              min={1}
              max={3650}
              className="w-28"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              disabled={busy}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((d) => (
              <Button
                key={d}
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => setDays(String(d))}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cleanup-confirm">
            Type <span className="font-mono font-semibold">DELETE</span> to
            confirm
          </Label>
          <Input
            id="cleanup-confirm"
            autoComplete="off"
            className="max-w-xs font-mono"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            disabled={busy}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          className="border-red-300 bg-white text-red-900 hover:bg-red-50"
          disabled={busy}
          onClick={() => void runCleanup()}
        >
          {busy ? "Deleting…" : "Delete matching accounts"}
        </Button>

        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {result && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-950">
            {result}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
