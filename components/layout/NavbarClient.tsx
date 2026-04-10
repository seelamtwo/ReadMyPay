"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { AdminNavLink } from "@/components/layout/AdminNavLink";

/**
 * `useSession().status === "authenticated"` is true for any truthy session object.
 * Malformed/partial session payloads can omit a real user — still show Log in, not Sign out.
 */
function hasAuthenticatedUser(session: Session | null | undefined): boolean {
  const id = session?.user?.id;
  if (typeof id === "string" && id.trim().length > 0) return true;
  const email = session?.user?.email;
  return typeof email === "string" && email.trim().length > 0;
}

/**
 * Client session only — avoids showing "Sign out" from a stale/wrong SSR session
 * (e.g. cached HTML) before the browser session is known.
 */
export function NavbarClient() {
  const { data: session, status } = useSession();
  const signedIn =
    status === "authenticated" && hasAuthenticatedUser(session);

  return (
    <nav className="flex items-center gap-3">
      <Link
        href="/privacy"
        className="hidden text-sm text-slate-600 hover:text-slate-900 sm:inline"
      >
        Privacy
      </Link>
      {status === "loading" ? (
        <div
          className="flex items-center gap-2"
          aria-busy="true"
          aria-label="Loading account menu"
        >
          <div className="h-8 w-24 animate-pulse rounded-md bg-slate-200/90" />
          <div className="h-8 w-20 animate-pulse rounded-md bg-slate-200/90" />
          <div className="h-8 w-20 animate-pulse rounded-md bg-slate-200/90" />
          <div className="h-8 w-16 animate-pulse rounded-md bg-slate-200/90" />
        </div>
      ) : signedIn ? (
        <>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
          <Link href="/account">
            <Button variant="ghost" size="sm">
              Account
            </Button>
          </Link>
          <Link href="/account/support">
            <Button variant="ghost" size="sm">
              Support
            </Button>
          </Link>
          <AdminNavLink />
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </Button>
        </>
      ) : (
        <>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </>
      )}
    </nav>
  );
}
