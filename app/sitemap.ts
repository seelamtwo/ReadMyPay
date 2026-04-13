/**
 * Next.js serves this at `/sitemap.xml` (no extra package needed).
 * In Google Search Console, submit: `${NEXT_PUBLIC_APP_URL}/sitemap.xml`
 * (e.g. https://www.readmypay.com/sitemap.xml).
 */
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";
import { getAllBlogPostsMerged } from "@/lib/blog-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const lastModified = new Date();

  const paths: { path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }[] =
    [
      { path: "", changeFrequency: "weekly", priority: 1 },
      { path: "/privacy", changeFrequency: "monthly", priority: 0.7 },
      { path: "/terms", changeFrequency: "monthly", priority: 0.7 },
      { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
      { path: "/blog", changeFrequency: "weekly", priority: 0.75 },
    ];

  const staticEntries = paths.map(({ path, changeFrequency, priority }) => ({
    url: path === "" ? base : `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  const merged = await getAllBlogPostsMerged();
  const blogPosts = merged.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date + "T12:00:00"),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...staticEntries, ...blogPosts];
}
