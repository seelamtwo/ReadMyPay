import type { BlogPostWithSeo } from "@/lib/blog-data";
import { getSiteUrl, SITE_NAME } from "@/lib/site-config";

type Props = { post: BlogPostWithSeo };

export function BlogArticleJsonLd({ post }: Props) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/blog/${post.slug}`;
  const keywords = (post.seoKeywords ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription?.trim() || post.excerpt,
    datePublished: `${post.date}T12:00:00.000Z`,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(keywords.length ? { keywords: keywords.join(", ") } : {}),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
