import { NextResponse } from "next/server";

type UserWithVerification = {
  emailVerified?: Date | null;
};

/**
 * After confirming the user is authenticated, block password signups who have not
 * verified email yet (session.user.emailVerified is null).
 */
export function rejectIfEmailNotVerified(
  user: UserWithVerification | undefined
): NextResponse | Response | null {
  if (!user) return null;
  if (user.emailVerified) return null;
  return NextResponse.json(
    { error: "Verify your email before using this feature." },
    { status: 403 }
  );
}
