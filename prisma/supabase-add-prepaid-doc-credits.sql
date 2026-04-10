-- Run in Supabase SQL Editor if you apply schema manually (otherwise use `npm run db:push`).
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "prepaidDocCredits" INTEGER NOT NULL DEFAULT 0;
