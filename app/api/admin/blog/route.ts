import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { logAdminAudit } from "@/lib/admin-audit";
import {
  adminMutationLimiter,
  rateLimitOr429,
} from "@/lib/rate-limit";
import { slugifyTitle } from "@/lib/slugify";
import { isMissingBlogTableError } from "@/lib/blog-data";

export const runtime = "nodejs";

const CreateBodySchema = z.object({
  title: z.string().min(1).max(512),
  content: z.string().min(1).max(200_000),
  excerpt: z.string().min(1).max(10_000),
  slug: z.string().max(320).optional(),
  seoKeywords: z.string().max(1024).optional(),
  seoTitle: z.string().max(512).optional(),
  seoDescription: z.string().max(8000).optional(),
  published: z.boolean().optional(),
});

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base || "post";
  let n = 0;
  for (;;) {
    const exists = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

export async function GET() {
  const authz = await requireAdminApi();
  if (!authz.ok) return authz.response;

  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        seoKeywords: true,
        seoTitle: true,
        seoDescription: true,
        published: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ posts });
  } catch (e) {
    if (isMissingBlogTableError(e)) {
      return NextResponse.json({
        posts: [],
        migrationRequired: true,
        error:
          "Blog table missing. Run `npm run db:push` or apply prisma/supabase-blog-post.sql in Supabase.",
      });
    }
    throw e;
  }
}

export async function POST(req: Request) {
  const authz = await requireAdminApi();
  if (!authz.ok) return authz.response;

  const blocked = await rateLimitOr429(
    adminMutationLimiter,
    `admin-blog:${authz.session.user!.id}`
  );
  if (blocked) return blocked;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    title,
    content,
    excerpt,
    slug: slugRaw,
    seoKeywords,
    seoTitle,
    seoDescription,
    published = true,
  } = parsed.data;

  const baseSlug = slugifyTitle(
    (slugRaw && slugRaw.trim()) || title
  );
  if (!baseSlug) {
    return NextResponse.json(
      { error: "Could not derive a URL slug from the title." },
      { status: 400 }
    );
  }

  let post;
  try {
    const slug = await uniqueSlug(baseSlug);
    post = await prisma.blogPost.create({
      data: {
        slug,
        title: title.trim(),
        excerpt: excerpt.trim(),
        content,
        seoKeywords: seoKeywords?.trim() || null,
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
        published,
        publishedAt: new Date(),
      },
    });
  } catch (e) {
    if (isMissingBlogTableError(e)) {
      return NextResponse.json(
        {
          error:
            "Blog table missing. Run `npm run db:push` or apply prisma/supabase-blog-post.sql.",
        },
        { status: 503 }
      );
    }
    throw e;
  }

  await logAdminAudit({
    adminUserId: authz.session.user!.id,
    action: "blog_post_create",
    payload: { postId: post.id, slug: post.slug },
  });

  return NextResponse.json({ ok: true, post });
}
