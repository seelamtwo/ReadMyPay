-- Run in Supabase SQL editor if you apply migrations manually (Prisma `db push` creates this automatically).

CREATE TYPE "DocumentUsageFlow" AS ENUM ('EXPLAIN', 'SPENDING');

CREATE TABLE "DocumentUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentName" VARCHAR(512) NOT NULL,
    "flow" "DocumentUsageFlow" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentUsageLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DocumentUsageLog_userId_createdAt_idx" ON "DocumentUsageLog"("userId", "createdAt" DESC);

ALTER TABLE "DocumentUsageLog" ADD CONSTRAINT "DocumentUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Match prisma/supabase-rls.sql: block Supabase Data API from this table.
REVOKE ALL ON TABLE public."DocumentUsageLog" FROM anon, authenticated;
ALTER TABLE public."DocumentUsageLog" ENABLE ROW LEVEL SECURITY;
