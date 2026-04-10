import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SUPPORT_EMAIL } from "@/lib/support-contact";

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
        <p className="mt-4 text-sm text-slate-500">Last updated April 7, 2026</p>
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
          <h2>Subscriptions &amp; pricing</h2>
          <p>
            Paid plans and one-time document purchases are processed by Stripe
            and are subject to Stripe&apos;s terms. Pricing (including monthly and
            per-document rates) is shown on the site and at checkout.
          </p>
          <p>
            If you cancel a subscription, you will not be charged for future
            billing cycles. Your paid access continues until the end of the
            subscription period you have already paid for.
          </p>
          <h2 id="refunds">Refund policy</h2>
          <p>
            Payments for the current subscription period or for completed
            one-time document purchases are generally <strong>non-refundable</strong>.
            We do not provide refunds for partial subscription periods or for
            unused prepaid document credits, except where required by law.
          </p>
          <p>
            If you believe a charge was made in error, contact{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we will
            review your case.
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
