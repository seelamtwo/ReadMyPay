import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Read My Pay handles sign-in, uploads, subscriptions, analytics, and your rights. Privacy-first: financial documents are not stored on our servers after processing.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <Link href="/" className="text-sm text-emerald-700 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Privacy policy
        </h1>
        <p className="mt-4 text-sm text-slate-500">Last updated April 2, 2026</p>
        <div className="prose prose-slate mt-8 max-w-none text-slate-700">
          <h2>What we collect</h2>
          <ul>
            <li>Your email address (to log you in)</li>
            <li>Your subscription plan and monthly usage count (for billing)</li>
            <li>
              Payment processing is handled entirely by Stripe — we never see
              your full card number
            </li>
          </ul>
          <h2>What we never collect</h2>
          <ul>
            <li>The documents you upload</li>
            <li>
              Financial data, account numbers, or figures extracted from your
              documents
            </li>
            <li>The AI-generated explanations we produce for you</li>
            <li>Server logs containing document or explanation content</li>
          </ul>
          <h2>How documents are processed</h2>
          <p>
            PDF and Word (.docx) text is extracted in your browser when possible. Text or image
            data is sent over HTTPS to our servers only to call the AI API and
            stream the response back to you. We do not write your document
            content or explanations to our database or file storage.
          </p>
          <h2>Third parties</h2>
          <ul>
            <li>
              OpenAI processes content to generate explanations. Use Zero Data
              Retention and non-training settings per your OpenAI agreement.
            </li>
            <li>Stripe processes payments.</li>
            <li>Vercel and your database host may process request metadata.</li>
          </ul>
          <h2>Your rights</h2>
          <p>
            You can stop using the service at any time. Contact support to
            request account deletion where applicable.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
