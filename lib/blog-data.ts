import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { blogPosts as staticBlogPosts, type BlogPost } from "@/lib/blog-posts";
import { staticBlogSeoDescription } from "@/lib/blog-static-seo";

export type { BlogPost };

export type BlogPostWithSeo = BlogPost & {
  seoKeywords?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  source: "static" | "db";
};

function enrichStaticPost(p: BlogPost): BlogPostWithSeo {
  return {
    ...p,
    seoDescription:
      p.seoDescription?.trim() ||
      staticBlogSeoDescription(p.slug) ||
      null,
    source: "static",
  };
}

function staticOnly(): BlogPostWithSeo[] {
  return staticBlogPosts.map(enrichStaticPost);
}

function mapDbRow(row: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  seoKeywords: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date;
}): BlogPostWithSeo {
  const seoDescription =
    row.seoDescription?.trim() ||
    staticBlogSeoDescription(row.slug) ||
    null;
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    date: row.publishedAt.toISOString().slice(0, 10),
    seoKeywords: row.seoKeywords,
    seoTitle: row.seoTitle,
    seoDescription,
    source: "db",
  };
}

/** True when the `BlogPost` table has not been migrated yet. */
export function isMissingBlogTableError(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    e.code === "P2021"
  );
}

/**
 * Published posts from DB plus static posts whose slug is not in DB (DB wins on conflict).
 */
export async function getAllBlogPostsMerged(): Promise<BlogPostWithSeo[]> {
  let dbRows: Awaited<ReturnType<typeof prisma.blogPost.findMany>>;
  try {
    dbRows = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch (e) {
    if (isMissingBlogTableError(e)) {
      return staticOnly();
    }
    throw e;
  }
  const dbSlugs = new Set(dbRows.map((r) => r.slug));
  const fromDb = dbRows.map(mapDbRow);
  const fromStaticStatic = staticBlogPosts
    .filter((p) => !dbSlugs.has(p.slug))
    .map(enrichStaticPost);
  return [...fromDb, ...fromStaticStatic].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getBlogPostBySlugMerged(
  slug: string
): Promise<BlogPostWithSeo | undefined> {
  try {
    const row = await prisma.blogPost.findFirst({
      where: { slug, published: true },
    });
    if (row) return mapDbRow(row);
  } catch (e) {
    if (!isMissingBlogTableError(e)) throw e;
  }
  const stat = staticBlogPosts.find((p) => p.slug === slug);
  if (!stat) return undefined;
  return enrichStaticPost(stat);
}

export function parseKeywordsCommaSeparated(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
