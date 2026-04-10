import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  registerLimiter,
  forgotPasswordLimiter,
  loginLimiter,
  resendVerificationLimiter,
  rateLimitOr429,
  getClientIpFromHeaders,
} from "@/lib/rate-limit";

/**
 * Must match Auth.js cookie names: on HTTPS the session cookie is
 * `__Secure-authjs.session-token`; getToken() defaults to secureCookie:false
 * and would only read `authjs.session-token` — so production looked logged-out
 * after every sign-in while localhost (http) worked.
 */
function secureCookieForRequest(request: NextRequest): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() === "https";
  }
  return request.nextUrl.protocol === "https:";
}

export async function middleware(request: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const path = request.nextUrl.pathname;
  const method = request.method;
  const ip = getClientIpFromHeaders(request.headers);

  if (method === "POST") {
    let blocked: Response | null = null;
    try {
      if (path === "/api/auth/register") {
        blocked = await rateLimitOr429(registerLimiter, `reg:${ip}`);
      } else if (path === "/api/auth/forgot-password") {
        blocked = await rateLimitOr429(forgotPasswordLimiter, `fp:${ip}`);
      } else if (path === "/api/auth/resend-verification") {
        blocked = await rateLimitOr429(
          resendVerificationLimiter,
          `resend:${ip}`
        );
      } else if (
        path === "/api/auth/callback/credentials" ||
        path === "/api/auth/signin/credentials"
      ) {
        blocked = await rateLimitOr429(loginLimiter, `login:${ip}`);
      }
    } catch (e) {
      console.error("[middleware] rate limit error", e);
    }
    if (blocked) return blocked;
  }

  let token: Awaited<ReturnType<typeof getToken>> = null;
  if (secret) {
    try {
      token = await getToken({
        req: request,
        secret,
        secureCookie: secureCookieForRequest(request),
      });
    } catch (e) {
      console.error("[middleware] getToken error", e);
    }
  } else {
    console.error(
      "[middleware] AUTH_SECRET or NEXTAUTH_SECRET is missing — set it in Vercel env (middleware cannot read session)."
    );
  }

  if (
    (path.startsWith("/dashboard") || path.startsWith("/account")) &&
    !token
  ) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  if (
    (path.startsWith("/dashboard") || path.startsWith("/account")) &&
    token
  ) {
    const verifiedAt = token.emailVerifiedAt as number | undefined;
    if (verifiedAt === 0) {
      const url = new URL("/verify-email", request.url);
      url.searchParams.set("pending", "1");
      const email = token.email as string | undefined;
      if (email) url.searchParams.set("email", email);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/resend-verification",
    "/api/auth/callback/credentials",
    "/api/auth/signin/credentials",
  ],
};
