import type { Metadata } from "next";
import Link from "next/link";
import { AppMark } from "@/components/brand/AppMark";
import { SignupForm } from "@/components/auth/SignupForm";
import { noIndexFollow } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Create a free Read My Pay account to upload documents for plain-English explanations and optional spending insights.",
  robots: noIndexFollow,
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Link href="/" className="mb-8 text-lg">
        <AppMark />
      </Link>
      <SignupForm />
      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
