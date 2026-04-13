import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppMark } from "@/components/brand/AppMark";
import { ResetPasswordPageClient } from "@/components/auth/ResetPasswordPageClient";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { noIndexFollow } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  title: "Reset password",
  description:
    "Choose a new password for your Read My Pay account using the link from your email.",
  robots: noIndexFollow,
};

function ResetPasswordFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>Loading…</CardHeader>
      <CardContent className="h-32 animate-pulse rounded-lg bg-slate-100" />
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Link href="/" className="mb-8 text-lg">
        <AppMark />
      </Link>
      <Suspense fallback={<ResetPasswordFallback />}>
        <ResetPasswordPageClient />
      </Suspense>
    </div>
  );
}
