"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { isTurnstileBypassed } from "@/lib/turnstile-bypass";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

type Props = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  className?: string;
};

/**
 * Cloudflare Turnstile. Without NEXT_PUBLIC_TURNSTILE_SITE_KEY, renders nothing.
 * Local `next dev` or NEXT_PUBLIC_TURNSTILE_BYPASS_LOCAL skips requiring a token (see isTurnstileRequiredClient).
 */
export function TurnstileField({ onToken, onExpire, className }: Props) {
  const [loadError, setLoadError] = useState(false);
  const bypass = isTurnstileBypassed();

  if (!siteKey) {
    return null;
  }

  return (
    <div className={className}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={onToken}
        onExpire={() => {
          onExpire?.();
        }}
        onError={() => setLoadError(true)}
      />
      {loadError && !bypass && (
        <p className="mt-2 max-w-sm text-center text-xs text-amber-800">
          Security check could not load (network, VPN, or ad blocker). Add{" "}
          <code className="rounded bg-amber-100 px-0.5">localhost</code> to your
          Turnstile widget domains in Cloudflare, or for local{" "}
          <code className="rounded bg-amber-100 px-0.5">npm start</code> set{" "}
          <code className="rounded bg-amber-100 px-0.5">
            NEXT_PUBLIC_TURNSTILE_BYPASS_LOCAL=true
          </code>{" "}
          in <code className="rounded bg-amber-100 px-0.5">.env.local</code>{" "}
          (never on production).
        </p>
      )}
    </div>
  );
}

export function isTurnstileRequiredClient(): boolean {
  if (!siteKey) return false;
  if (isTurnstileBypassed()) return false;
  return true;
}
