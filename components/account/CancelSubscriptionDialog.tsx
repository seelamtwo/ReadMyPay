"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const REASON_OPTIONS = [
  { value: "too_expensive", label: "Too expensive" },
  { value: "not_using_enough", label: "Not using it enough" },
  { value: "missing_features", label: "Missing features I need" },
  { value: "switching_service", label: "Switching to another service" },
  { value: "other", label: "Other" },
] as const;

type ReasonValue = (typeof REASON_OPTIONS)[number]["value"];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CancelSubscriptionDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"confirm" | "reason">("confirm");
  const [reasonCategory, setReasonCategory] = useState<ReasonValue>(
    "too_expensive"
  );
  const [reasonDetail, setReasonDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function resetAndClose() {
    setStep("confirm");
    setReasonCategory("too_expensive");
    setReasonDetail("");
    setError(null);
    onClose();
  }

  async function submitCancel() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reasonCategory,
          reasonDetail: reasonDetail.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
      };
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status}).`);
        return;
      }
      if (!data.ok) {
        setError("Unexpected response from server.");
        return;
      }
      resetAndClose();
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Network error. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-sub-title"
    >
      <Card className="max-w-md border-slate-200 shadow-xl">
        <CardHeader className="rounded-t-lg border-b border-slate-100 bg-slate-50/80">
          <CardTitle id="cancel-sub-title" className="text-lg text-slate-900">
            {step === "confirm"
              ? "Cancel subscription?"
              : "Why are you canceling?"}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {step === "confirm" ? (
              <>
                Your plan stays active until the end of the current billing
                period. You won&apos;t be charged again after that. See{" "}
                <a
                  href="/terms#refunds"
                  className="text-emerald-700 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  refund policy
                </a>
                .
              </>
            ) : (
              "Optional feedback helps us improve. Choose one option and add details if you like."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {step === "confirm" ? (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetAndClose}
                  disabled={loading}
                >
                  Keep subscription
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => setStep("reason")}
                  disabled={loading}
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <fieldset className="space-y-2">
                <legend className="sr-only">Cancellation reason</legend>
                {REASON_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-start gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-500"
                  >
                    <input
                      type="radio"
                      name="cancel-reason"
                      className="mt-0.5"
                      checked={reasonCategory === opt.value}
                      onChange={() => setReasonCategory(opt.value)}
                    />
                    <span className="text-slate-800">{opt.label}</span>
                  </label>
                ))}
              </fieldset>
              <div className="space-y-1.5">
                <Label htmlFor="cancel-detail" className="text-slate-700">
                  Anything else? (optional)
                </Label>
                <textarea
                  id="cancel-detail"
                  rows={3}
                  maxLength={2000}
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  placeholder="Tell us more…"
                />
              </div>
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("confirm")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => void submitCancel()}
                  disabled={loading}
                >
                  {loading ? "Canceling…" : "Confirm cancellation"}
                </Button>
              </div>
            </>
          )}
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
