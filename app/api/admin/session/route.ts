import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { emailIsAdmin } from "@/lib/admin-allowlist";

/**
 * Lets the client show an "Admin" nav link only when the session is allowlisted.
 * Security: same check as /admin page; non-admins receive 404.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse(null, { status: 404 });
  }
  if (!emailIsAdmin(session.user.email)) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
