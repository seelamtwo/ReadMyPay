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

const PatchBodySchema = z.object({
  title: z.string().min(1).max(512).optional(),
  content: z.string().min(1).max(200_000).optional(),
  excerpt: z.string().min(1).max(10_000).optional(),
  slug: z.string().max(320).optional(),
  seoKeywords: z.string().max(1024).optional(),
  seoTitle: z.string().max(512).optional(),
  seoDescription: z.string().max(8000).optional(),
  published: z.boolean().optional(),
});

async function uniqueSlugExcluding(
  base: string,
  excludeId: string
): Promise<string> {
  let candidate = base || "post";
  let n = 0;
  for (;;) {
    const exists = await prisma.blogPost.findFirst({
      where: {
        slug: candidate,
        NOT: { id: excludeId },
      },
      select: { id: true },
    });
    if (!exists) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authz = await requireAdminApi();
  if (!authz.ok) return authz.response;

  const blocked = await rateLimitOr429(
    adminMutationLimiter,
    `admin-blog:${authz.session.user!.id}`
  );
  if (blocked) return blocked;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let existing;
  try {
    existing = await prisma.blogPost.findUnique({ where: { id } });
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
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = parsed.data;
  let nextSlug = existing.slug;

  if (data.slug !== undefined && data.slug.trim() !== "") {
    const base = slugifyTitle(data.slug.trim());
    if (!base) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
    nextSlug =
      base === existing.slug
        ? existing.slug
        : await uniqueSlugExcluding(base, id);
  }

  let post;
  try {
    post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title.trim() } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.excerpt !== undefined ? { excerpt: data.excerpt.trim() } : {}),
        slug: nextSlug,
        ...(data.seoKeywords !== undefined
          ? { seoKeywords: data.seoKeywords.trim() || null }
          : {}),
        ...(data.seoTitle !== undefined
          ? { seoTitle: data.seoTitle.trim() || null }
          : {}),
        ...(data.seoDescription !== undefined
          ? { seoDescription: data.seoDescription.trim() || null }
          : {}),
        ...(data.published !== undefined ? { published: data.published } : {}),
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
    action: "blog_post_update",
    payload: { postId: post.id, slug: post.slug },
  });

  return NextResponse.json({ ok: true, post });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const authz = await requireAdminApi();
  if (!authz.ok) return authz.response;

  const blocked = await rateLimitOr429(
    adminMutationLimiter,
    `admin-blog:${authz.session.user!.id}`
  );
  if (blocked) return blocked;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let existing;
  try {
    existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, slug: true },
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
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await prisma.blogPost.delete({ where: { id } });
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
    action: "blog_post_delete",
    payload: { postId: id, slug: existing.slug },
  });

  return NextResponse.json({ ok: true });
}
