/** True when the transactional From address uses Resend’s test @resend.dev domain (see lib/transactional-email-from.ts). */
export function isResendSandboxSender(from: string | undefined | null): boolean {
  const f = (from ?? "").toLowerCase();
  return f.includes("@resend.dev");
}
