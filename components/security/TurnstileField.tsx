"use client";

import { Turnstile } from "@marsidev/react-turnstile";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

type Props = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  className?: string;
};

/**
 * Cloudflare Turnstile. Without NEXT_PUBLIC_TURNSTILE_SITE_KEY, renders nothing;
 * server skips verification when TURNSTILE_SECRET_KEY is unset (local dev).
 */
export function TurnstileField({ onToken, onExpire, className }: Props) {
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
      />
    </div>
  );
}

export function isTurnstileRequiredClient(): boolean {
  return Boolean(siteKey);
}
