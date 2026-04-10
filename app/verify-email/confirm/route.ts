import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/verify-email-token";

/** Node: Prisma */
export const runtime = "nodejs";

/**
 * User-facing verification link (emails point here, not /api/auth/...).
 * Long token + /api/ URLs in mail are often flagged by Safe Browsing as phishing.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  const origin = req.nextUrl.origin;

  const result = await verifyEmailToken(token);
  if (!result.ok) {
    if (result.reason === "missing") {
      return NextResponse.redirect(new URL("/verify-email?error=missing", origin));
    }
    return NextResponse.redirect(new URL("/verify-email?error=expired", origin));
  }

  return NextResponse.redirect(new URL("/login?verified=1", origin));
}
