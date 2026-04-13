import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getAllBlogPostsMerged } from "@/lib/blog-data";
import { DEFAULT_SITE_KEYWORDS, SITE_NAME } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Pay Stubs, Taxes & Statements Explained",
  description:
    "Plain-English articles on pay stubs, W-2s, 1099s, bank statements, Social Security, Medicare, pensions, and IRS notices—plus how Read My Pay keeps documents private.",
  keywords: DEFAULT_SITE_KEYWORDS,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Blog — guides for pay stubs & tax forms | ${SITE_NAME}`,
    description:
      "Plain-English articles on pay stubs, W-2s, 1099s, bank statements, and benefits paperwork.",
    url: "/blog",
  },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function BlogIndexPage() {
  const posts = await getAllBlogPostsMerged();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <Link href="/" className="text-sm text-emerald-700 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Blog</h1>
        <p className="mt-2 text-slate-600">
          Plain-language notes on pay stubs, statements, and using Read My Pay.
        </p>
        <ul className="mt-10 divide-y divide-slate-200 border-t border-slate-200">
          {posts.map((post) => (
            <li key={post.slug} className="py-8 first:pt-6">
              <article>
                <p className="text-sm text-slate-500">{formatDate(post.date)}</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-emerald-800 hover:underline"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-slate-700">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline"
                >
                  Read more →
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
