"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import {
  passwordMeetsPolicy,
  MIN_PASSWORD_LENGTH,
} from "@/lib/password-policy";
import {
  TurnstileField,
  isTurnstileRequiredClient,
} from "@/components/security/TurnstileField";

function formatRegisterError(data: {
  error?: string | Record<string, string[] | undefined>;
  detail?: string;
}): string {
  const err = data.error;
  let base: string;
  if (typeof err === "string") base = err;
  else if (err && typeof err === "object") {
    const parts = Object.values(err).flat().filter(Boolean) as string[];
    base = parts.length ? parts.join(" ") : "Could not create account.";
  } else {
    base = "Could not create account.";
  }
  if (typeof data.detail === "string" && data.detail.trim()) {
    return `${base} (${data.detail.trim()})`;
  }
  return base;
}

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;
  const policyOk = passwordMeetsPolicy(password);
  const captchaOk =
    !isTurnstileRequiredClient() || turnstileToken.trim().length > 0;
  const canSubmit =
    email.trim().length > 0 &&
    policyOk &&
    password === confirmPassword &&
    confirmPassword.length > 0 &&
    captchaOk;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!policyOk) {
      setError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters and include a number and a special character.`
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatRegisterError(data));
        return;
      }
      const q = new URLSearchParams({
        email: email.trim().toLowerCase(),
      });
      if (data.resendSandboxSender === true) {
        q.set("resendSandbox", "1");
      }
      router.push(`/verify-email?${q.toString()}`);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Free tier includes 1 document explanation per month; add more at
          $0.99 each or subscribe for $9.99/month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrengthBar password={password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-red-600" role="alert">
                Passwords do not match.
              </p>
            )}
          </div>
          <TurnstileField
            className="flex justify-center"
            onToken={(t) => setTurnstileToken(t)}
            onExpire={() => setTurnstileToken("")}
          />
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !canSubmit}
          >
            {loading ? "Creating…" : "Sign up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
