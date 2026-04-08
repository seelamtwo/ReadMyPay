import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Terms of Service",
  description: "Terms for using Read My Pay",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <Link href="/" className="text-sm text-emerald-700 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Terms of service
        </h1>
        <p className="mt-4 text-sm text-slate-500">Last updated April 2, 2026</p>
        <div className="prose prose-slate mt-8 max-w-none text-slate-700">
          <h2>Not financial advice</h2>
          <p>
            Read My Pay provides educational explanations only. Nothing on this
            site is legal, tax, or investment advice. Consult a qualified
            professional for decisions about your finances.
          </p>
          <h2>Acceptable use</h2>
          <p>
            You agree not to misuse the service, attempt to access others&apos;
            data, or upload unlawful content. We may suspend accounts that
            violate these terms.
          </p>
          <h2>Subscriptions</h2>
          <p>
            Paid plans are billed through Stripe subject to Stripe&apos;s terms.
            Cancellations and refunds follow the policies shown at checkout.
          </p>
          <h2>Disclaimer</h2>
          <p>
            AI outputs may be incomplete or inaccurate. You are responsible for
            verifying important information against your original documents and
            official sources.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
