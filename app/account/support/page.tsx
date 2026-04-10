import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactSupportForm } from "@/components/account/ContactSupportForm";
import { SUPPORT_EMAIL } from "@/lib/support-contact";

export const metadata = {
  title: "Support",
  description: "Contact and policies",
};

export default async function AccountSupportPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/support");
  }

  const email =
    typeof session.user.email === "string" ? session.user.email : null;

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Support</h1>
      <p className="mt-2 text-slate-600">
        Billing questions, account help, and refund information.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Contact us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-slate-700">
          <p>
            Email us directly at{" "}
            <a
              className="font-medium text-emerald-700 hover:underline"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>
            . We typically respond within one business day.
          </p>
          <div>
            <h3 className="mb-3 font-medium text-slate-900">Contact form</h3>
            <ContactSupportForm defaultEmail={email} />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Refunds &amp; cancellation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>
            <span className="font-medium text-slate-900">Cancellation:</span> If
            you cancel a subscription from billing management, you keep access
            through the end of the period you already paid for. You will not be
            charged for the next billing cycle.
          </p>
          <p>
            <span className="font-medium text-slate-900">Refunds:</span> Fees
            for the current billing period or for completed one-time document
            purchases are generally not refunded. See our full{" "}
            <a href="/terms#refunds" className="text-emerald-700 hover:underline">
              refund policy
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </>
  );
}
