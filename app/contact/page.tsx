import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SUPPORT_EMAIL } from "@/lib/support-contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Email Read My Pay for billing, account help, or product feedback. We respond to support requests as soon as we can.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <Link href="/" className="text-sm text-emerald-700 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Contact us</h1>
        <p className="mt-4 text-slate-700">
          For billing questions, account help, or feedback, email us at{" "}
          <a
            className="font-medium text-emerald-700 hover:underline"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
          . We typically respond within one business day.
        </p>
        <p className="mt-4 text-sm text-slate-600">
          Have an account? After you{" "}
          <Link
            href="/login?callbackUrl=/account/support"
            className="font-medium text-emerald-700 hover:underline"
          >
            sign in
          </Link>
          , open{" "}
          <span className="font-medium text-slate-800">Support</span> in the
          top bar (next to Account) for
          the contact form and refund details.
        </p>
      </main>
      <Footer />
    </div>
  );
}
