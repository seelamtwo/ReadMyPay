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
  userId: z.string().min(1),
  docsUsedThisMonth: z.number().int().min(0).max(10_000),
});

export async function POST(req: Request) {
  const authz = await requireAdminApi();
  if (!authz.ok) return authz.response;

  const blocked = await rateLimitOr429(
    adminMutationLimiter,
    `admin-docs:${authz.session.user!.id}`
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

  const { userId, docsUsedThisMonth } = parsed.data;
  const adminId = authz.session.user!.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const prev = await prisma.subscription.findUnique({
    where: { userId },
    select: { docsUsedThisMonth: true },
  });

  const updated = await prisma.subscription.upsert({
    where: { userId },
    update: { docsUsedThisMonth },
    create: {
      userId,
      stripeCustomerId: `pending_${userId}`,
      docsUsedThisMonth,
      prepaidDocCredits: 0,
    },
  });

  await logAdminAudit({
    adminUserId: adminId,
    targetUserId: userId,
    action: "SET_DOCS_USED_MONTH",
    payload: {
      previous: prev?.docsUsedThisMonth ?? null,
      next: updated.docsUsedThisMonth,
    },
  });

  return NextResponse.json({
    ok: true,
    docsUsedThisMonth: updated.docsUsedThisMonth,
  });
}
