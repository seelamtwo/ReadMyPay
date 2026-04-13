import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppMark } from "@/components/brand/AppMark";
import { LoginForm } from "@/components/auth/LoginForm";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { noIndexFollow } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Sign in to Read My Pay to explain pay stubs, tax forms, and bank statements, or use spending summaries on your plan.",
  robots: noIndexFollow,
};

function LoginFormFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>Loading…</CardHeader>
      <CardContent className="h-32 animate-pulse rounded-lg bg-slate-100" />
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Link href="/" className="mb-8 text-lg">
        <AppMark />
      </Link>
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-sm text-slate-600">
        No account?{" "}
        <Link href="/signup" className="font-medium text-emerald-700 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
