/**
 * Render PDF pages to JPEG data URLs in the browser (for scanned / image-only PDFs).
 */

const DEFAULT_MAX_PAGES = 12;
const DEFAULT_MAX_EDGE_PX = 1600;
const DEFAULT_JPEG_QUALITY = 0.82;

export async function renderPdfPagesToDataUrls(
  file: File,
  opts?: {
    maxPages?: number;
    maxEdgePx?: number;
    jpegQuality?: number;
  }
): Promise<string[]> {
  const maxPages = opts?.maxPages ?? DEFAULT_MAX_PAGES;
  const maxEdgePx = opts?.maxEdgePx ?? DEFAULT_MAX_EDGE_PX;
  const jpegQuality = opts?.jpegQuality ?? DEFAULT_JPEG_QUALITY;

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pageCount = Math.min(pdf.numPages, maxPages);
  const urls: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(
      maxEdgePx / base.width,
      maxEdgePx / base.height,
      2.5
    );
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const w = Math.max(1, Math.floor(viewport.width));
    const h = Math.max(1, Math.floor(viewport.height));
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser.");

    await page.render({
      canvasContext: ctx,
      canvas,
      viewport,
    }).promise;

    urls.push(canvas.toDataURL("image/jpeg", jpegQuality));
  }

  return urls;
}
