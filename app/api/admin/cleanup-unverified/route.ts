import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { logAdminAudit } from "@/lib/admin-audit";
import {
  adminMutationLimiter,
  rateLimitOr429,
} from "@/lib/rate-limit";

export const runtime = "nodejs";

const BodySchema = z.object({
  /** Delete credential signups that are still unverified and older than this many days. */
  olderThanDays: z.number().int().min(1).max(3650),
});

export async function POST(req: Request) {
  const authz = await requireAdminApi();
  if (!authz.ok) return authz.response;

  const blocked = await rateLimitOr429(
    adminMutationLimiter,
    `admin-cleanup-unverified:${authz.session.user!.id}`
  );
  if (blocked) return blocked;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { olderThanDays } = parsed.data;
  const adminId = authz.session.user!.id;

  const cutoff = new Date(
    Date.now() - olderThanDays * 24 * 60 * 60 * 1000
  );

  const where = {
    requiresEmailVerification: true,
    emailVerified: null as null,
    createdAt: { lt: cutoff },
  };

  const preview = await prisma.user.findMany({
    where,
    select: { id: true, email: true },
    orderBy: { createdAt: "asc" },
  });

  if (preview.length === 0) {
    await logAdminAudit({
      adminUserId: adminId,
      targetUserId: null,
      action: "CLEANUP_UNVERIFIED_USERS",
      payload: {
        olderThanDays,
        cutoffIso: cutoff.toISOString(),
        deleted: 0,
        emails: [],
      },
    });
    return NextResponse.json({
      ok: true,
      deleted: 0,
      olderThanDays,
      cutoffIso: cutoff.toISOString(),
      emails: [] as string[],
    });
  }

  const emailsPreview = preview.map((u) => u.email);

  try {
    const { deleted } = await prisma.$transaction(async (tx) => {
      const r = await tx.user.deleteMany({ where });
      await tx.$executeRaw`
        DELETE FROM "StripePrepaidFulfillment" AS f
        WHERE NOT EXISTS (
          SELECT 1 FROM "User" AS u WHERE u.id = f."userId"
        )
      `;
      return { deleted: r.count };
    });

    await logAdminAudit({
      adminUserId: adminId,
      targetUserId: null,
      action: "CLEANUP_UNVERIFIED_USERS",
      payload: {
        olderThanDays,
        cutoffIso: cutoff.toISOString(),
        deleted,
        emails: emailsPreview.slice(0, 100),
        emailTotal: emailsPreview.length,
      },
    });

    return NextResponse.json({
      ok: true,
      deleted,
      olderThanDays,
      cutoffIso: cutoff.toISOString(),
      emails: emailsPreview.slice(0, 200),
      previewCount: emailsPreview.length,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Cleanup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
