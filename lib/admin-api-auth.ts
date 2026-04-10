import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { emailIsAdmin } from "@/lib/admin-allowlist";
import { rejectIfEmailNotVerified } from "@/lib/require-email-verified";

export type AdminApiAuthResult =
  | { ok: true; session: Session }
  | { ok: false; response: NextResponse };

/**
 * Authorize admin API routes: session required, email verified, ADMIN_EMAILS match.
 * Non-admins get 404 (same as /admin page).
 */
export async function requireAdminApi(): Promise<AdminApiAuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const verifyBlock = rejectIfEmailNotVerified(session.user);
  if (verifyBlock) {
    return { ok: false, response: verifyBlock as NextResponse };
  }
  if (!emailIsAdmin(session.user.email)) {
    return { ok: false, response: new NextResponse(null, { status: 404 }) };
  }
  return { ok: true, session };
}
