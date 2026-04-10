import { Resend } from "resend";
import { SUPPORT_EMAIL } from "@/lib/support-contact";
import { TRANSACTIONAL_EMAIL_FROM } from "@/lib/transactional-email-from";
import { formatResendError } from "@/lib/resend-errors";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type SendResult =
  | { ok: true }
  | { ok: false; code: "not_configured" | "send_failed"; message?: string };

/**
 * Delivers a support message to the support inbox via Resend.
 * From and To are both support@readmypay.com; Reply-To is the user when available.
 */
export async function sendSupportContactEmail(opts: {
  subject: string;
  message: string;
  userEmail: string | null;
  userId: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = TRANSACTIONAL_EMAIL_FROM;
  const to = SUPPORT_EMAIL;

  if (!apiKey) {
    return { ok: false, code: "not_configured" };
  }

  const subjectLine = `[Read My Pay] ${opts.subject}`.slice(0, 200);
  const meta = opts.userEmail?.trim()
    ? `<p><strong>Signed-in as:</strong> ${escapeHtml(opts.userEmail.trim())} <span style="color:#64748b">(${escapeHtml(opts.userId)})</span></p>`
    : `<p><strong>User ID:</strong> ${escapeHtml(opts.userId)}</p>`;

  const html = `${meta}<p><strong>Subject:</strong> ${escapeHtml(opts.subject)}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/><div style="white-space:pre-wrap;font-size:14px;line-height:1.5">${escapeHtml(opts.message)}</div>`;

  const text = [
    opts.userEmail?.trim()
      ? `Signed-in as: ${opts.userEmail.trim()} (${opts.userId})`
      : `User ID: ${opts.userId}`,
    "",
    `Subject: ${opts.subject}`,
    "",
    opts.message,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: opts.userEmail?.trim() || undefined,
      subject: subjectLine,
      html,
      text,
    });
    if (error) {
      const detail = formatResendError(error);
      console.error("[send-support-contact-email] Resend:", detail);
      return { ok: false, code: "send_failed", message: detail };
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
