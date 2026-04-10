import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function logAdminAudit(opts: {
  adminUserId: string;
  targetUserId?: string | null;
  action: string;
  payload: Prisma.InputJsonValue;
  stripeRefundId?: string | null;
}): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      adminUserId: opts.adminUserId,
      targetUserId: opts.targetUserId ?? null,
      action: opts.action.slice(0, 64),
      payload: opts.payload,
      stripeRefundId: opts.stripeRefundId?.slice(0, 128) ?? null,
    },
  });
}
