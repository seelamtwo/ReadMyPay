import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogPostBody } from "@/components/blog/BlogPostBody";
import { BlogRelatedPosts } from "@/components/blog/BlogRelatedPosts";
import { BlogArticleJsonLd } from "@/components/seo/BlogArticleJsonLd";
import { getBlogPostBySlugMerged } from "@/lib/blog-data";
import { buildBlogPostMetadata } from "@/lib/blog-metadata";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const post = await getBlogPostBySlugMerged(params.slug);
  if (!post) return { title: "Not found" };
  return buildBlogPostMetadata(post);
}

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

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlugMerged(params.slug);
  if (!post) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <BlogArticleJsonLd post={post} />
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <Link href="/blog" className="text-sm text-emerald-700 hover:underline">
          ← Blog
        </Link>
        <p className="mt-6 text-sm text-slate-500">{formatDate(post.date)}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{post.title}</h1>
        <p className="mt-3 text-lg text-slate-600">{post.excerpt}</p>
        <BlogPostBody content={post.content} />
        <BlogRelatedPosts slug={post.slug} />
        <p className="mt-10 border-t border-slate-200 pt-8 text-sm text-slate-600">
          <Link href="/blog" className="font-medium text-emerald-700 hover:underline">
            ← All posts
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
