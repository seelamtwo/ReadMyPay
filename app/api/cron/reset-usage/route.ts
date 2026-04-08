import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  await prisma.subscription.updateMany({
    data: {
      docsUsedThisMonth: 0,
      billingPeriodStart: new Date(),
    },
  });

  return new Response("Usage reset", { status: 200 });
}
