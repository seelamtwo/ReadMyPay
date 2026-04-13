import * as XLSX from "xlsx";

/** Must match `MAX_TEXT_PER_DOC` in `app/api/spending-summary/route.ts`. */
const MAX_TEXT_CHARS = 45_000;
const MAX_SHEETS = 30;

/**
 * Reads .xlsx / .xls / .xlsm in the browser and returns a CSV-like text block
 * for each sheet (suitable for transaction parsing).
 */
export async function extractTextFromExcel(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, {
    type: "array",
    cellDates: true,
  });

  const parts: string[] = [];
  for (const name of wb.SheetNames.slice(0, MAX_SHEETS)) {
    const sh = wb.Sheets[name];
    if (!sh) continue;
    const csv = XLSX.utils.sheet_to_csv(sh);
    parts.push(`--- Sheet: ${name} ---\n${csv}`);
  }

  let out = parts.join("\n\n").trim();
  if (out.length > MAX_TEXT_CHARS) {
    out = `${out.slice(0, MAX_TEXT_CHARS - 40)}\n\n...[text truncated]`;
  }
  return out;
}
