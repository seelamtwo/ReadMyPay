"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { Button } from "@/components/ui/button";

export function NavbarClient({ session }: { session: Session | null }) {
  return (
    <nav className="flex items-center gap-3">
      <Link
        href="/privacy"
        className="hidden text-sm text-slate-600 hover:text-slate-900 sm:inline"
      >
        Privacy
      </Link>
      {session?.user ? (
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
