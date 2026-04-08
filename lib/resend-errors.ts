/** Resend API / SDK errors are not always `{ message: string }`. */
export function formatResendError(err: unknown): string {
  if (err == null) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err !== "object") return String(err);
  const o = err as Record<string, unknown>;
  if (typeof o.message === "string") return o.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown Resend error";
  }
}
