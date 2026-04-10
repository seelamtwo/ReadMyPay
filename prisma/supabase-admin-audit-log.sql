-- Run in Supabase SQL editor if you apply migrations manually.

CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "action" VARCHAR(64) NOT NULL,
    "payload" JSONB NOT NULL,
    "stripeRefundId" VARCHAR(128),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminAuditLog_adminUserId_createdAt_idx" ON "AdminAuditLog"("adminUserId", "createdAt" DESC);
CREATE INDEX "AdminAuditLog_targetUserId_idx" ON "AdminAuditLog"("targetUserId");

REVOKE ALL ON TABLE public."AdminAuditLog" FROM anon, authenticated;
ALTER TABLE public."AdminAuditLog" ENABLE ROW LEVEL SECURITY;
