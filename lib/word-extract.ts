/**
 * Browser-only: extract plain text from .docx (Office Open XML) using mammoth.
 * Legacy .doc (binary) is not supported.
 */

export async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const { value, messages } = await mammoth.extractRawText({ arrayBuffer });
  if (messages?.length) {
    const errs = messages.filter((m) => m.type === "error");
    if (errs.length > 0 && !value.trim()) {
      throw new Error(errs.map((e) => e.message).join("; ") || "Invalid Word file");
    }
  }
  return value.trim();
}
