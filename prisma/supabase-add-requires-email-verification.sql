-- Run once in Supabase SQL Editor if you use SQL instead of `prisma db push`.
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "requiresEmailVerification" BOOLEAN NOT NULL DEFAULT false;
