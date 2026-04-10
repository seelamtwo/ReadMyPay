import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { emailIsAdmin } from "@/lib/admin-allowlist";

/**
 * For server-rendered admin pages: must be logged in; must match ADMIN_EMAILS.
 * Non-admins get 404 (do not reveal that the route exists).
 */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }
  const em = session.user.email;
  if (!emailIsAdmin(em)) {
    notFound();
  }
  return session;
}
