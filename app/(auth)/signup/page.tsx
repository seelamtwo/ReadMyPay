import Link from "next/link";
import { AppMark } from "@/components/brand/AppMark";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = {
  title: "Sign up",
  description: "Create a Read My Pay account",
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
