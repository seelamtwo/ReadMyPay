import type { Metadata } from "next";
import Link from "next/link";
import { AppMark } from "@/components/brand/AppMark";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { noIndexFollow } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Read My Pay password",
  robots: noIndexFollow,
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Link href="/" className="mb-8 text-lg">
        <AppMark />
      </Link>
      <ForgotPasswordForm />
    </div>
  );
}
