"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

/**
 * Client session only — avoids showing "Sign out" from a stale/wrong SSR session
 * (e.g. cached HTML) before the browser session is known.
 */
export function NavbarClient() {
  const { data: session, status } = useSession();

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
          <div className="h-8 w-20 animate-pulse rounded-md bg-slate-200/90" />
          <div className="h-8 w-16 animate-pulse rounded-md bg-slate-200/90" />
        </div>
      ) : session?.user ? (
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
