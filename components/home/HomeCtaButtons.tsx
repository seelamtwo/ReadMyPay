"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { hasAuthenticatedUser } from "@/lib/session-guards";

type HeroProps = {
  className?: string;
};

/**
 * Hero CTAs on the landing page: session-aware so logged-in users are not
 * sent to login/signup again.
 */
export function HomeHeroCtas({ className }: HeroProps) {
  const { data: session, status } = useSession();
  const signedIn =
    status === "authenticated" && hasAuthenticatedUser(session);

  if (status === "loading") {
    return (
      <div className={`mt-10 flex flex-wrap gap-4 ${className ?? ""}`}>
        <div className="h-11 w-44 animate-pulse rounded-lg bg-slate-200/90" />
        <div className="h-11 w-28 animate-pulse rounded-lg bg-slate-200/90" />
      </div>
    );
  }

  if (signedIn) {
    return (
      <div className={`mt-10 flex flex-wrap gap-4 ${className ?? ""}`}>
        <Link href="/dashboard">
          <Button size="lg" className="gap-2">
            Go to dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/account">
          <Button variant="outline" size="lg">
            Account
          </Button>
        </Link>
        <Link href="/blog">
          <Button variant="outline" size="lg">
            Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`mt-10 flex flex-wrap gap-4 ${className ?? ""}`}>
      <Link href="/signup">
        <Button size="lg" className="gap-2">
          Get started <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
      <Link href="/login">
        <Button variant="outline" size="lg">
          Log in
        </Button>
      </Link>
      <Link href="/blog">
        <Button variant="outline" size="lg">
          Blog
        </Button>
      </Link>
    </div>
  );
}

/** Bottom-of-page pricing CTA on the home page. */
export function HomePricingCta() {
  const { data: session, status } = useSession();
  const signedIn =
    status === "authenticated" && hasAuthenticatedUser(session);

  if (status === "loading") {
    return (
      <div className="mt-10 inline-block">
        <div className="h-11 w-56 animate-pulse rounded-lg bg-slate-200/90" />
      </div>
    );
  }

  if (signedIn) {
    return (
      <Link href="/dashboard" className="mt-10 inline-block">
        <Button size="lg">Open dashboard</Button>
      </Link>
    );
  }

  return (
    <Link href="/signup" className="mt-10 inline-block">
      <Button size="lg">Create free account</Button>
    </Link>
  );
}
