import type { Session } from "next-auth";

/**
 * True when the session represents a real signed-in user (id or email present).
 * Avoids treating malformed session payloads as authenticated.
 */
export function hasAuthenticatedUser(
  session: Session | null | undefined
): boolean {
  const id = session?.user?.id;
  if (typeof id === "string" && id.trim().length > 0) return true;
  const email = session?.user?.email;
  return typeof email === "string" && email.trim().length > 0;
}
