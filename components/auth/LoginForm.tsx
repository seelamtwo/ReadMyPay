"use client";

import { useEffect, useState } from "react";
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
import { isAuthFlowPath, safePostLoginPath } from "@/lib/safe-post-login-path";

const POST_LOGIN_FALLBACK = "/dashboard";

/** After successful signIn, prefer server `url` but never send users back to auth pages. */
function resolvePostLoginHref(
  res: { ok: boolean; url: string | null },
  fallback: string
): string {
  if (!res.ok || !res.url) return fallback;
  try {
    const u = new URL(res.url);
    if (u.origin !== window.location.origin) return fallback;
    const pathOnly = u.pathname;
    if (isAuthFlowPath(pathOnly)) return fallback;
    return u.pathname + u.search;
  } catch {
    return fallback;
  }
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = safePostLoginPath(
    searchParams.get("callbackUrl"),
    POST_LOGIN_FALLBACK
  );
  const resetSuccess = searchParams.get("reset") === "success";
  const emailVerified = searchParams.get("verified") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const showGoogle =
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  useEffect(() => {
    const err = searchParams.get("error");
    const code = searchParams.get("code");
    if (!err) return;
    if (err === "CredentialsSignin") {
      setError(
        code === "captcha"
          ? "Security check failed. Refresh the page, complete the captcha again, and try signing in."
          : "Invalid email or password."
      );
      return;
    }
    if (err === "Configuration") {
      setError(
        "Sign-in is misconfigured. If this persists, contact support."
      );
      return;
    }
    setError("Could not sign in. Try again.");
  }, [searchParams]);

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
        // Server default is window.location (this page); set so success JSON `url` is not /login.
        redirectTo: callbackUrl,
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
      if (!res.ok) {
        setError(
          "Sign-in did not complete. Check your connection and try again."
        );
        return;
      }
      // Full navigation so the session cookie and middleware run reliably.
      const href = resolvePostLoginHref(res, callbackUrl);
      window.location.assign(href);
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
