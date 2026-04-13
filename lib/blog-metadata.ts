import type { Metadata } from "next";
import {
  parseKeywordsCommaSeparated,
  type BlogPostWithSeo,
} from "@/lib/blog-data";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME } from "@/lib/site-config";

export function buildBlogPostMetadata(post: BlogPostWithSeo): Metadata {
  const title = post.seoTitle?.trim() || post.title;
  const description = post.seoDescription?.trim() || post.excerpt;
  const keywords = parseKeywordsCommaSeparated(post.seoKeywords);
  const publishedTime = `${post.date}T12:00:00.000Z`;
  const ogImage = {
    url: DEFAULT_OG_IMAGE_PATH,
    width: 1200,
    height: 630,
    alt: `${title} — ${SITE_NAME}`,
  };

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
      siteName: SITE_NAME,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}
