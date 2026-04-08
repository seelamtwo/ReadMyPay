import { Resend } from "resend";
import { getAppBaseUrl } from "@/lib/app-base-url";

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

export async function sendEmailVerification(
  to: string,
  token: string
): Promise<SendResult> {
  const verifyUrl = buildEmailVerificationUrl(token);
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[Read My Pay] Email verification (Resend not configured). Link for ${to}:\n${verifyUrl}`
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
      subject: "Verify your Read My Pay email",
      html: `
        <p>Thanks for signing up. Confirm your email to use your account.</p>
        <p><a href="${verifyUrl}">Verify email</a></p>
        <p>This link expires in 24 hours.</p>
      `,
      text: `Verify your email: ${verifyUrl}\n\nExpires in 24 hours.`,
    });
    if (error) {
      console.error("[send-verification-email] Resend:", error.message);
      return {
        ok: false,
        code: "send_failed",
        message: error.message,
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      code: "send_failed",
      message: e instanceof Error ? e.message : "send failed",
    };
  }
}
