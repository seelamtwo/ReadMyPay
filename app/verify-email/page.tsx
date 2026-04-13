import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppMark } from "@/components/brand/AppMark";
import { VerifyEmailClient } from "@/components/auth/VerifyEmailClient";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { noIndexFollow } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  title: "Verify email",
  description:
    "Confirm your email address to finish setting up your Read My Pay account and secure your login.",
  robots: noIndexFollow,
};

function VerifyEmailFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>Loading…</CardHeader>
      <CardContent className="h-40 animate-pulse rounded-lg bg-slate-100" />
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Link href="/" className="mb-8 text-lg">
        <AppMark />
      </Link>
      <Suspense fallback={<VerifyEmailFallback />}>
        <VerifyEmailClient />
      </Suspense>
    </div>
  );
}
