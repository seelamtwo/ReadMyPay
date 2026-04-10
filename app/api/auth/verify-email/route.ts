import { NextRequest, NextResponse } from "next/server";

/**
 * Legacy verification URL from older emails. Redirects to the canonical
 * `/verify-email/confirm` route so links are not under `/api/`.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  const origin = req.nextUrl.origin;
  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?error=missing", origin));
  }
  const url = new URL("/verify-email/confirm", origin);
  url.searchParams.set("token", token);
  return NextResponse.redirect(url, 307);
}
