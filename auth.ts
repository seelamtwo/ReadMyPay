import "@/lib/ensure-origin-env";
import NextAuth, { type NextAuthConfig, CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyTurnstileToken } from "@/lib/verify-turnstile";
import { getClientIpFromHeaders } from "@/lib/client-ip";

/** JWT millis: 0 = must complete email verification flow. */
function emailVerifiedAtForJwt(dbUser: {
  emailVerified: Date | null;
  requiresEmailVerification: boolean;
}): number {
  if (dbUser.requiresEmailVerification && !dbUser.emailVerified) return 0;
  if (dbUser.emailVerified) return dbUser.emailVerified.getTime();
  // Legacy password accounts (flag false) or OAuth without a stored date — treat as verified for access.
  return Date.now();
}

/** Distinct code so the login form can show a captcha message (not "wrong password"). */
class CaptchaSignin extends CredentialsSignin {
  constructor() {
    super();
    this.code = "captcha";
  }
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      turnstileToken: { label: "Turnstile", type: "text" },
    },
    async authorize(credentials, request) {
      if (!credentials?.email || !credentials?.password) return null;
      const email = String(credentials.email).trim();
      const password = String(credentials.password);
      const rawTs = credentials.turnstileToken;
      const turnstile =
        typeof rawTs === "string" && rawTs.trim().length > 0
          ? rawTs.trim()
          : null;

      const ip = getClientIpFromHeaders(request.headers);
      const captcha = await verifyTurnstileToken(turnstile, ip);
      if (!captcha.ok) {
        console.warn("[auth] credentials: captcha failed", captcha.reason ?? "");
        throw new CaptchaSignin();
      }

      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });
      if (!user?.hashedPassword) return null;
      const valid = await bcrypt.compare(password, user.hashedPassword);
      if (!valid) return null;
      return { id: user.id, email: user.email, name: user.name };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await prisma.subscription.create({
        data: {
          userId: user.id,
          stripeCustomerId: `pending_${user.id}`,
        },
      });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        if (user.email) token.email = user.email;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { emailVerified: true, requiresEmailVerification: true },
        });
        token.emailVerifiedAt = dbUser
          ? emailVerifiedAtForJwt(dbUser)
          : Date.now();
      } else if (token.sub && (token.emailVerifiedAt as number) === 0) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { emailVerified: true, requiresEmailVerification: true },
        });
        if (dbUser) {
          token.emailVerifiedAt = emailVerifiedAtForJwt(dbUser);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.email) session.user.email = token.email as string;
        const at = token.emailVerifiedAt;
        session.user.emailVerified =
          typeof at === "number" && at > 0 ? new Date(at) : null;
      }
      return session;
    },
  },
  trustHost: true,
});
