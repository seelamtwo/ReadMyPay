"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import {
  TurnstileField,
  isTurnstileRequiredClient,
} from "@/components/security/TurnstileField";

function sanitizeInternalPath(raw: string | null): string {
  const fallback = "/dashboard";
  if (!raw || typeof raw !== "string") return fallback;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  return t;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeInternalPath(searchParams.get("callbackUrl"));
  const resetSuccess = searchParams.get("reset") === "success";
  const emailVerified = searchParams.get("verified") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const showGoogle =
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        turnstileToken,
        redirect: false,
      });
      if (res === undefined) {
        setError(
          "Could not reach the sign-in service. Check your connection and refresh the page."
        );
        return;
      }
      if (res.error) {
        setError(
          res.code === "captcha"
            ? "Security check failed. Refresh the page, complete the captcha again, and try signing in."
            : "Invalid email or password."
        );
        return;
      }
      // Full navigation so the session cookie and middleware run reliably (fixes "nothing happens" after sign-in on some prod setups).
      window.location.assign(callbackUrl);
    } catch {
      setError(
        "Sign-in failed unexpectedly (often a browser extension or a bad response from the server). Refresh and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>
          Use your email and password to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetSuccess && (
          <p
            className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
          >
            Your password was updated. Sign in with your new password.
          </p>
        )}
        {emailVerified && (
          <p
            className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
          >
            Email verified. You can sign in now.
          </p>
        )}
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                Forgot password?
              </Link>
            </p>
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
            disabled={
              loading ||
              (isTurnstileRequiredClient() && !turnstileToken.trim())
            }
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        {showGoogle && (
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={() => signIn("google", { callbackUrl })}
          >
            Continue with Google
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
