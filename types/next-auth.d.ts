import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      emailVerified: Date | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** Unix ms when verified; 0 = pending verification (credentials signup). */
    emailVerifiedAt?: number;
  }
}
