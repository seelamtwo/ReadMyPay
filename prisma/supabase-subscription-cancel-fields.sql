-- Run in Supabase SQL editor if applying manually (Prisma `db push` includes these).

ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "cancelAtPeriodEndAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "cancelReasonCategory" VARCHAR(64);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "cancelReasonDetail" TEXT;
