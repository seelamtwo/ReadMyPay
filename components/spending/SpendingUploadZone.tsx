"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { extractTextFromPDF, extractTextFromImage } from "@/lib/pdf-extract";
import { extractTextFromDocx } from "@/lib/word-extract";
import { renderPdfPagesToDataUrls } from "@/lib/pdf-raster";
import { isPdfFile, isImageFile, isWordDocxFile } from "@/lib/file-kind";
import {
  isPlausibleBankOrCardStatement,
  MULTI_NON_STATEMENT_MESSAGE,
} from "@/lib/statement-detect";
import { PrivacyPill } from "@/components/upload/PrivacyPill";
import { Button } from "@/components/ui/button";
import { SpendingResults } from "@/components/spending/SpendingResults";
import type { ParsedTransaction } from "@/types/spending";

const MIN_TEXT = 10;
const MAX_FILES = 12;
const MAX_IMAGE_URLS = 16;
const PDF_RASTER_PAGES = 6;

const MULTI_FILE_HINT =
  "You can upload several bank or card statements at once (one OpenAI request consolidates them). Other document types cannot be uploaded together—use one file for those.";

type ExtractedPart = {
  name: string;
  text?: string;
  imageUrls?: string[];
};

function validateMultiStatementParts(parts: ExtractedPart[]): string | null {
  if (parts.length <= 1) return null;
  for (const p of parts) {
    const text = p.text?.trim() ?? "";
    const hasImages = (p.imageUrls?.length ?? 0) > 0;
    if (text.length > 0) {
      if (!isPlausibleBankOrCardStatement(p.name, text)) {
        return MULTI_NON_STATEMENT_MESSAGE;
      }
    } else if (hasImages) {
      if (!isPlausibleBankOrCardStatement(p.name, "")) {
        return MULTI_NON_STATEMENT_MESSAGE;
      }
    }
  }
  return null;
}

async function extractOne(file: File): Promise<ExtractedPart> {
  if (isPdfFile(file)) {
    const text = (await extractTextFromPDF(file)).trim();
    if (text.length >= MIN_TEXT) {
      return { name: file.name, text };
    }
    const imgs = await renderPdfPagesToDataUrls(file, {
      maxPages: PDF_RASTER_PAGES,
    });
    return { name: file.name, imageUrls: imgs };
  }
  if (isWordDocxFile(file)) {
    const text = (await extractTextFromDocx(file)).trim();
    return { name: file.name, text };
  }
  if (isImageFile(file)) {
    const dataUrl = await extractTextFromImage(file);
    if (!dataUrl.startsWith("data:image")) {
      throw new Error(`Not a valid image: ${file.name}`);
    }
    return { name: file.name, imageUrls: [dataUrl] };
  }
  throw new Error(`Unsupported file: ${file.name}`);
}

export function SpendingUploadZone() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<ParsedTransaction[] | null>(
    null
  );
  const [summary, setSummary] = useState<string>("");

  const updateTransactionCategory = useCallback(
    (index: number, category: string) => {
      setTransactions((prev) => {
        if (!prev) return prev;
        const next = [...prev];
        const row = next[index];
        if (!row) return prev;
        next[index] = { ...row, category };
        return next;
      });
    },
    []
  );

  const onDrop = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setError(null);
    setTransactions(null);
    setSummary("");

    setBusy(true);

    try {
      const parts = await Promise.all(files.map((f) => extractOne(f)));

      const multiErr = validateMultiStatementParts(parts);
      if (multiErr) {
        setError(multiErr);
        return;
      }

      const documents: { name: string; text: string }[] = [];
      const imageGroups: { name: string; urls: string[] }[] = [];
      let imageBudget = MAX_IMAGE_URLS;

      for (const part of parts) {
        const t = part.text?.trim() ?? "";
        if (t.length > 0) {
          documents.push({ name: part.name, text: t });
        }
        const imgs = part.imageUrls ?? [];
        if (imgs.length > 0 && imageBudget > 0) {
          const slice = imgs.slice(0, imageBudget);
          imageBudget -= slice.length;
          imageGroups.push({ name: part.name, urls: slice });
        }
      }

      if (documents.length === 0 && imageGroups.length === 0) {
        setError("No readable text or images found in these files.");
        return;
      }

      const res = await fetch("/api/spending-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          documents: documents.length ? documents : undefined,
          imageGroups: imageGroups.length ? imageGroups : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Spending analysis failed."
        );
        return;
      }

      setTransactions(data.transactions ?? []);
      setSummary(
        typeof data.overallSummary === "string" ? data.overallSummary : ""
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not process this file."
      );
    } finally {
      setBusy(false);
    }
  }, []);

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const tooMany = rejections.some((r) =>
      r.errors.some((e) => e.code === "too-many-files")
    );
    if (tooMany) {
      setError(`You can upload at most ${MAX_FILES} files at once.`);
      return;
    }
    const code = rejections[0]?.errors[0]?.code;
    if (code === "file-too-large") {
      setError("File is too large (max 12 MB).");
      return;
    }
    if (code === "file-invalid-type") {
      setError("Use PDF, Word (.docx), or an image.");
      return;
    }
    if (rejections.length) {
      setError("Could not accept that file.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    maxFiles: MAX_FILES,
    maxSize: 12 * 1024 * 1024,
    disabled: busy,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? "border-teal-400 bg-teal-50"
            : "border-slate-200 hover:border-slate-300"
        } ${busy ? "pointer-events-none opacity-70" : ""}`}
      >
        <input {...getInputProps()} />
        <p className="font-medium text-slate-900">
          {busy
            ? "Analyzing statements…"
            : isDragActive
              ? "Drop your statement(s) here"
              : "Drop bank or card statement(s)"}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Up to {MAX_FILES} statements in one batch (consolidated) · PDF, Word
          (.docx), or image · {MULTI_FILE_HINT}
        </p>
        <PrivacyPill />
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {transactions !== null && (
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setTransactions(null);
              setSummary("");
              setError(null);
            }}
          >
            Clear results
          </Button>
        </div>
      )}

      {transactions !== null && (
        <SpendingResults
          transactions={transactions}
          overallSummary={summary}
          onCategoryChange={updateTransactionCategory}
        />
      )}
    </div>
  );
}
