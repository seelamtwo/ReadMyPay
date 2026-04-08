import "@/lib/ensure-origin-env";
import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyTurnstileToken } from "@/lib/verify-turnstile";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      turnstileToken: { label: "Turnstile", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const email = String(credentials.email).trim();
      const password = String(credentials.password);
      const turnstile = credentials.turnstileToken
        ? String(credentials.turnstileToken)
        : null;

      const captcha = await verifyTurnstileToken(turnstile, null);
      if (!captcha.ok) return null;

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
          select: { emailVerified: true },
        });
        token.emailVerifiedAt = dbUser?.emailVerified
          ? dbUser.emailVerified.getTime()
          : 0;
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
