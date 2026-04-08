/**
 * Browser-only helpers: PDF text via PDF.js; images as data URL for the explain API.
 */

export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? String(item.str) : ""))
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
}

export async function extractTextFromImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function detectDocumentType(filename: string, text: string): string {
  if (filename.toLowerCase().endsWith(".docx")) return "Word document";
  const lower = (filename + text).toLowerCase();
  if (lower.includes("w-2") || lower.includes("wage")) return "W-2 tax form";
  if (lower.includes("1099")) return "1099 tax form";
  if (lower.includes("pay stub") || lower.includes("earnings statement"))
    return "pay stub";
  if (lower.includes("bank statement") || lower.includes("account summary"))
    return "bank statement";
  if (lower.includes("social security")) return "Social Security statement";
  if (lower.includes("medicare")) return "Medicare statement";
  if (lower.includes("mortgage")) return "mortgage statement";
  if (lower.includes("1040")) return "tax return";
  return "financial document";
}
