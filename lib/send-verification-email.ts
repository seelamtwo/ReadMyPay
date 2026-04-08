import { Resend } from "resend";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { isResendSandboxSender } from "@/lib/resend-sender";
import { TRANSACTIONAL_EMAIL_FROM } from "@/lib/transactional-email-from";
import { formatResendError } from "@/lib/resend-errors";

const VERIFY_PATH = "/api/auth/verify-email";

export function buildEmailVerificationUrl(token: string): string {
  const base = getAppBaseUrl();
  const url = new URL(VERIFY_PATH, base.endsWith("/") ? base : `${base}/`);
  url.searchParams.set("token", token);
  return url.toString();
}

type SendResult =
  | { ok: true }
  | { ok: false; code: "not_configured" | "send_failed"; message?: string };

function shouldLogVerificationLinkToConsole(): boolean {
  const v = process.env.READ_MY_PAY_LOG_VERIFICATION_LINK?.trim().toLowerCase();
  return v === "true" || v === "1";
}

export async function sendEmailVerification(
  to: string,
  token: string
): Promise<SendResult> {
  const verifyUrl = buildEmailVerificationUrl(token);
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = TRANSACTIONAL_EMAIL_FROM;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[Read My Pay] Verification link (no RESEND_API_KEY — email was NOT sent) for ${to}:\n${verifyUrl}`
      );
      const skip = process.env.READMY_PAY_DEV_SKIP_EMAIL?.trim().toLowerCase();
      if (skip === "true" || skip === "1") {
        return { ok: true };
      }
    }
    return { ok: false, code: "not_configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "Verify your Read My Pay email",
      html: `
        <p>Thanks for signing up. Confirm your email to use your account.</p>
        <p><a href="${verifyUrl}">Verify email</a></p>
        <p>This link expires in 24 hours.</p>
      `,
      text: `Verify your email: ${verifyUrl}\n\nExpires in 24 hours.`,
    });
    if (error) {
      const detail = formatResendError(error);
      console.error("[send-verification-email] Resend error:", detail);
      console.error("[send-verification-email] Verify URL (for manual test):", verifyUrl);
      return {
        ok: false,
        code: "send_failed",
        message: detail,
      };
    }
    if (isResendSandboxSender(from)) {
      console.warn(
        "[send-verification-email] From address uses @resend.dev; signups at other addresses may not receive mail. Use lib/transactional-email-from.ts with a verified domain address."
      );
    }
    console.info(
      `[Read My Pay] Resend accepted verification email to=${to} id=${(data as { id?: string })?.id ?? "?"} — if the inbox is empty, open Resend → Emails / Logs for delivery status.`
    );
    if (shouldLogVerificationLinkToConsole()) {
      console.warn(`[Read My Pay] Verification link:\n${verifyUrl}`);
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "send failed";
    console.error("[send-verification-email] exception:", msg, verifyUrl);
    return {
      ok: false,
      code: "send_failed",
      message: msg,
    };
  }
}
