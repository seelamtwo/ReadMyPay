import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionActions } from "@/components/account/SubscriptionActions";
import { docLimitForTier } from "@/lib/usage";

export const metadata = {
  title: "Account",
  description: "Subscription and usage",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const sp = searchParams;
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const tier = subscription?.tier ?? "FREE";
  const used = subscription?.docsUsedThisMonth ?? 0;
  const limit = docLimitForTier(tier);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Account</h1>
      <p className="mt-2 text-slate-600">
        Signed in as{" "}
        <span className="font-medium text-slate-900">{session.user.email}</span>
      </p>

      {sp.success === "true" && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Thanks—your subscription was updated. It may take a moment to reflect
          below.
        </p>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Plan & usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-medium text-slate-900">Tier:</span> {tier}
          </p>
          <p>
            Documents used this month: {used}
            {limit !== Number.MAX_SAFE_INTEGER ? ` / ${limit}` : ""}
          </p>
          <Link
            href="/dashboard"
            className="inline-block pt-2 text-emerald-700 hover:underline"
          >
            Go to dashboard →
          </Link>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Monthly plan</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionActions />
        </CardContent>
      </Card>
    </div>
  );
}
