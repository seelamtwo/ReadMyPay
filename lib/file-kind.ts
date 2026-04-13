/** Detect file kind when `File.type` is missing (common on desktop file picks). */

export function isPdfFile(file: File): boolean {
  if (file.type === "application/pdf") return true;
  return file.name.toLowerCase().endsWith(".pdf");
}

export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

/** .docx only (Open XML). Legacy .doc is not supported. */
export function isWordDocxFile(file: File): boolean {
  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return true;
  }
  return /\.docx$/i.test(file.name);
}

/** Excel workbooks (.xlsx, .xlsm, legacy .xls). */
export function isExcelFile(file: File): boolean {
  const t = file.type;
  if (
    t ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    t === "application/vnd.ms-excel" ||
    t === "application/vnd.ms-excel.sheet.macroEnabled.12"
  ) {
    return true;
  }
  return /\.(xlsx|xlsm|xls)$/i.test(file.name);
}
