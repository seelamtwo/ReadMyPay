import type { Metadata } from "next";
import {
  parseKeywordsCommaSeparated,
  type BlogPostWithSeo,
} from "@/lib/blog-data";

export function buildBlogPostMetadata(post: BlogPostWithSeo): Metadata {
  const title = post.seoTitle?.trim() || post.title;
  const description = post.seoDescription?.trim() || post.excerpt;
  const keywords = parseKeywordsCommaSeparated(post.seoKeywords);
  const publishedTime = `${post.date}T12:00:00.000Z`;

  return {
    title,
    description,
    ...(keywords.length ? { keywords } : {}),
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}
