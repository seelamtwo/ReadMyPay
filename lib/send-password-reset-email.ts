import { Resend } from "resend";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { TRANSACTIONAL_EMAIL_FROM } from "@/lib/transactional-email-from";
import { formatResendError } from "@/lib/resend-errors";

const RESET_PATH = "/reset-password";

export function buildPasswordResetUrl(token: string): string {
  const base = getAppBaseUrl();
  const url = new URL(RESET_PATH, base.endsWith("/") ? base : `${base}/`);
  url.searchParams.set("token", token);
  return url.toString();
}

type SendResult =
  | { ok: true }
  | { ok: false; code: "not_configured" | "send_failed"; message?: string };

function shouldLogResetLinkInConsole(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  if (
    process.env.READ_MY_PAY_LOG_RESET_LINK === "true" ||
    process.env.READ_MY_PAY_LOG_RESET_LINK === "1"
  ) {
    return true;
  }
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    ""
  ).toLowerCase();
  if (appUrl.includes("localhost") || appUrl.includes("127.0.0.1")) {
    return true;
  }
  return false;
}

/**
 * Sends password reset email via Resend when configured.
 * In development without Resend, logs the link and still returns ok.
 */
export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<SendResult> {
  const resetUrl = buildPasswordResetUrl(token);
  const logLink = shouldLogResetLinkInConsole();
  if (logLink) {
    console.warn(
      `[Read My Pay] Password reset URL (use this if the email link fails — localhost only works on this machine):\n${resetUrl}`
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = TRANSACTIONAL_EMAIL_FROM;

  if (!apiKey) {
    if (logLink) {
      console.warn(
        `[Read My Pay] Password reset: Resend not configured; no email sent. Use the URL above for ${to}.`
      );
      return { ok: true };
    }
    return { ok: false, code: "not_configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: "Reset your Read My Pay password",
      html: `
          <p>You asked to reset your Read My Pay password.</p>
          <p><a href="${resetUrl}">Choose a new password</a></p>
          <p>This link expires in one hour. If you did not request this, you can ignore this email.</p>
        `,
      text: `Reset your Read My Pay password: ${resetUrl}\n\nThis link expires in one hour.`,
    });
    if (error) {
      const detail = formatResendError(error);
      console.error("[send-password-reset-email] Resend:", detail);
      return {
        ok: false,
        code: "send_failed",
        message: detail,
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      code: "send_failed",
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
