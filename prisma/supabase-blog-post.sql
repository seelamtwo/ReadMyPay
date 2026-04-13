-- Run in Supabase SQL Editor if you use manual migrations (optional; prefer `npm run db:push` with schema.prisma).

CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(320) NOT NULL,
    "title" VARCHAR(512) NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "seoKeywords" VARCHAR(1024),
    "seoTitle" VARCHAR(512),
    "seoDescription" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS "BlogPost_published_publishedAt_idx" ON "BlogPost"("published", "publishedAt" DESC);
