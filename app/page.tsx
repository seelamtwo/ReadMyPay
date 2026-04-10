import { FileText, Lock, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrustBanner } from "@/components/trust/TrustBanner";
import { PrivacyTable } from "@/components/trust/PrivacyTable";
import {
  HomeHeroCtas,
  HomePricingCta,
} from "@/components/home/HomeCtaButtons";

export const metadata = {
  title: "Read My Pay — Plain-English financial documents",
  description:
    "Upload your pay stub, bank statement, or tax document — get a plain-English explanation in seconds. Nothing stored.",
};

export default async function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-slate-200 bg-gradient-to-b from-emerald-50/80 to-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              Privacy-first AI
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Financial documents, explained in plain English
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600">
              Upload your pay stub, bank statement, or tax form and get a clear,
              jargon-free walkthrough—plus practical savings tips. Your file is
              never stored on our servers.
            </p>
            <HomeHeroCtas />
            <div className="mt-10 max-w-2xl">
              <TrustBanner />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Built for real life
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <FileText className="h-10 w-10 text-emerald-600" />
              <h3 className="mt-4 font-semibold text-slate-900">
                Pay stubs & tax forms
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Understand withholdings, boxes, and what each line means before
                you file or negotiate.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <Sparkles className="h-10 w-10 text-emerald-600" />
              <h3 className="mt-4 font-semibold text-slate-900">
                Actionable tips
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Each explanation ends with savings nudges grounded in what the
                document shows—not investment advice.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <Lock className="h-10 w-10 text-emerald-600" />
              <h3 className="mt-4 font-semibold text-slate-900">
                Zero document storage
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                PDFs, Word (.docx), and images stay in your browser or pass through memory
                only. We keep email and usage counts—that’s it.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-slate-900">
              What we keep vs. what we don’t
            </h2>
            <p className="mt-2 text-slate-600">
              Aligned with a privacy-first processing model.
            </p>
            <div className="mt-8">
              <PrivacyTable />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">Simple pricing</h2>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                detail: "1 document / month included",
              },
              {
                name: "Pay per document",
                price: "$0.99",
                detail: "Each extra document after your free one",
              },
              {
                name: "Monthly",
                price: "$9.99/mo",
                detail: "Up to 20 documents / month",
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <p className="text-sm font-medium text-emerald-700">{tier.name}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{tier.price}</p>
                <p className="mt-2 text-sm text-slate-600">{tier.detail}</p>
              </div>
            ))}
          </div>
          <HomePricingCta />
        </section>
      </main>
      <Footer />
    </div>
  );
}
