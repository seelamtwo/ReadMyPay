"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  TurnstileField,
  isTurnstileRequiredClient,
} from "@/components/security/TurnstileField";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const pending = searchParams.get("pending") === "1";
  const error = searchParams.get("error");
  const emailFromQuery = searchParams.get("email")?.trim() ?? "";
  const resendSandbox = searchParams.get("resendSandbox") === "1";

  const [email, setEmail] = useState(emailFromQuery);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  const errorBanner = useMemo(() => {
    if (error === "missing") {
      return "That verification link was invalid. Request a new link below.";
    }
    if (error === "expired") {
      return "That link has expired. Request a new verification email below.";
    }
    return null;
  }, [error]);

  async function onResend(e: React.FormEvent) {
    e.preventDefault();
    setResendMessage(null);
    setResendError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResendError(
          typeof data.error === "string"
            ? data.error
            : "Could not send email. Try again."
        );
        return;
      }
      setResendMessage(
        typeof data.message === "string"
          ? data.message
          : "If that account needs verification, check your inbox."
      );
    } catch {
      setResendError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const captchaOk =
    !isTurnstileRequiredClient() || turnstileToken.trim().length > 0;
  const canResend = email.includes("@") && captchaOk;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          {pending
            ? "We need to confirm your email before you can use the dashboard or account settings."
            : "We sent a link to your inbox. Open it on this device to finish signing up."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorBanner && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {errorBanner}
          </p>
        )}
        {resendSandbox && (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            The app is using a Resend test From address (@resend.dev). Mail to
            arbitrary signup addresses may not be delivered. Change{" "}
            <code className="rounded bg-amber-100 px-1">
              TRANSACTIONAL_EMAIL_FROM
            </code>{" "}
            in{" "}
            <code className="rounded bg-amber-100 px-1">
              lib/transactional-email-from.ts
            </code>{" "}
            to your verified domain address and configure it in{" "}
            <a
              href="https://resend.com/domains"
              className="font-medium text-emerald-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Resend → Domains
            </a>
            .
          </p>
        )}
        <p className="text-sm text-slate-600">
          Didn&apos;t get the email? Check spam, then resend below.
        </p>
        <form onSubmit={onResend} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-email">Email</Label>
            <Input
              id="verify-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <TurnstileField
            className="flex justify-center"
            onToken={(t) => setTurnstileToken(t)}
            onExpire={() => setTurnstileToken("")}
          />
          {resendError && (
            <p className="text-sm text-red-600" role="alert">
              {resendError}
            </p>
          )}
          {resendMessage && (
            <p className="text-sm text-emerald-800" role="status">
              {resendMessage}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !canResend}
          >
            {loading ? "Sending…" : "Resend verification email"}
          </Button>
        </form>
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Back to log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
