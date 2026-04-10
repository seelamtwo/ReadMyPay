-- Run in Supabase SQL Editor if you apply schema manually (otherwise `npm run db:push`).
CREATE TABLE IF NOT EXISTS "StripePrepaidFulfillment" (
  "checkoutSessionId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StripePrepaidFulfillment_pkey" PRIMARY KEY ("checkoutSessionId")
);
