import { prisma } from "@/lib/db";
import type { DocumentUsageFlow } from "@prisma/client";
import { FREE_MONTHLY_DOC_LIMIT } from "@/lib/usage";

export type DocumentUsageLogInput = {
  documentName: string;
  flow: DocumentUsageFlow;
};

/** Label for the account usage table when multiple statement files are analyzed together. */
export function buildSpendingUsageDocumentLabel(textNames: string[], imageNames: string[]): string {
  const names = [...textNames, ...imageNames].map((n) => n.trim()).filter(Boolean);
  if (names.length === 0) return "Spending summary";
  if (names.length === 1) return names[0]!;
  const joined = names.join(", ");
  return joined.length > 512 ? `${joined.slice(0, 509)}…` : joined;
}

/** Call after a successful document completes; increments monthly count, may consume prepaid, and optionally records a usage row. */
export async function incrementSubscriptionDocUsage(
  userId: string,
  log?: DocumentUsageLogInput
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.findUnique({
      where: { userId },
    });
    const tier = sub?.tier ?? "FREE";
    const used = sub?.docsUsedThisMonth ?? 0;
    const credits = sub?.prepaidDocCredits ?? 0;

    const decrementCredit =
      tier === "FREE" && used >= FREE_MONTHLY_DOC_LIMIT && credits > 0;

    await tx.subscription.upsert({
      where: { userId },
      update: {
        docsUsedThisMonth: { increment: 1 },
        ...(decrementCredit ? { prepaidDocCredits: { decrement: 1 } } : {}),
      },
      create: {
        userId,
        stripeCustomerId: `pending_${userId}`,
        docsUsedThisMonth: 1,
        prepaidDocCredits: 0,
      },
    });

    if (log) {
      const documentName =
        log.documentName.trim().slice(0, 512) || "Document";
      await tx.documentUsageLog.create({
        data: {
          userId,
          documentName,
          flow: log.flow,
        },
      });
    }
  });
}
