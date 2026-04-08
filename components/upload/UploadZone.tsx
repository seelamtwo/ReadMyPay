"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  extractTextFromPDF,
  extractTextFromImage,
  detectDocumentType,
} from "@/lib/pdf-extract";
import { extractTextFromDocx } from "@/lib/word-extract";
import { renderPdfPagesToDataUrls } from "@/lib/pdf-raster";
import { isPdfFile, isImageFile, isWordDocxFile } from "@/lib/file-kind";
import { useExplain } from "@/hooks/useExplain";
import { PrivacyPill } from "@/components/upload/PrivacyPill";
import { ProcessingSteps } from "@/components/upload/ProcessingSteps";
import { ExplanationStream } from "@/components/explanation/ExplanationStream";
import { SavingsNudge } from "@/components/explanation/SavingsNudge";
import { DownloadButton } from "@/components/explanation/DownloadButton";

type Status = "idle" | "extracting" | "rasterizing" | "explaining";

const MIN_TEXT_LEN = 10;

export function UploadZone() {
  const [status, setStatus] = useState<Status>("idle");
  const [clientError, setClientError] = useState<string | null>(null);
  const { explain, explanation, isStreaming, resetExplanation } = useExplain();

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setClientError(null);
      resetExplanation();
      setStatus("extracting");
      let text = "";
      const isPDF = isPdfFile(file);
      const isImage = isImageFile(file);
      const isWord = isWordDocxFile(file);

      if (!isPDF && !isImage && !isWord) {
        setClientError(
          "Unsupported file. Use PDF, Word (.docx), or an image (JPG, PNG, or WebP). Legacy .doc files are not supported—save as .docx in Word first."
        );
        setStatus("idle");
        return;
      }

      try {
        if (isPDF) {
          text = await extractTextFromPDF(file);
        } else if (isWord) {
          text = await extractTextFromDocx(file);
        } else {
          text = await extractTextFromImage(file);
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Could not read this file.";
        setClientError(
          `Could not read the file (${msg}). Try a different format or re-save the document.`
        );
        setStatus("idle");
        return;
      }

      if (isImage && !text.startsWith("data:image")) {
        setClientError(
          "Image upload did not produce a usable preview. Try a different file or format."
        );
        setStatus("idle");
        return;
      }

      if (isWord && text.length < MIN_TEXT_LEN) {
        setClientError(
          "Almost no text was found in this Word file. It may be mostly pictures or empty—add text in Word, or export as PDF / upload page images instead."
        );
        setStatus("idle");
        return;
      }

      if (isPDF && text.length < MIN_TEXT_LEN) {
        setStatus("rasterizing");
        let pageImages: string[] = [];
        try {
          pageImages = await renderPdfPagesToDataUrls(file);
        } catch (rasterErr) {
          const m =
            rasterErr instanceof Error
              ? rasterErr.message
              : "Could not render PDF.";
          setClientError(
            `This PDF has little or no selectable text (often a scan). We tried to render it for vision but failed (${m}). Try re-saving the PDF or upload photos of each page.`
          );
          setStatus("idle");
          return;
        }
        if (pageImages.length === 0) {
          setClientError(
            "Could not render any pages from this PDF. Try an image file instead."
          );
          setStatus("idle");
          return;
        }

        const docType = detectDocumentType(file.name, "");
        setStatus("explaining");
        try {
          await explain({
            extractedText: "",
            documentType: docType,
            isImage: true,
            imageUrls: pageImages,
          });
        } catch {
          setClientError(
            "Something went wrong while requesting the explanation. Check that OPENAI_API_KEY is set and try again."
          );
        }
        setStatus("idle");
        return;
      }

      const docType = detectDocumentType(
        file.name,
        isPDF || isWord ? text : ""
      );
      setStatus("explaining");
      try {
        await explain({
          extractedText: text,
          documentType: docType,
          isImage: isImage,
        });
      } catch {
        setClientError(
          "Something went wrong while requesting the explanation. Check that OPENAI_API_KEY is set and try again."
        );
      }
      setStatus("idle");
    },
    [explain, resetExplanation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: status !== "idle",
  });

  const displayError = clientError;
  const displayExplanation =
    explanation || (displayError ? `**Error:** ${displayError}` : "");

  const statusLabel =
    status === "extracting"
      ? "Reading your document…"
      : status === "rasterizing"
        ? "Rendering scanned pages for AI vision…"
        : status === "explaining"
          ? "Generating explanation…"
          : isDragActive
            ? "Drop it here"
            : "Upload your document";

  return (
    <div>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragActive
            ? "border-emerald-400 bg-emerald-50"
            : "border-slate-200 hover:border-slate-300"
        } ${status !== "idle" ? "pointer-events-none opacity-80" : ""}`}
      >
        <input {...getInputProps()} />
        <p className="font-medium text-slate-900">{statusLabel}</p>
        <p className="mt-1 text-sm text-slate-500">
          PDF, Word (.docx), JPG, PNG, or WebP · Max 10MB · Scanned PDFs
          auto-rendered
        </p>
        <PrivacyPill />
      </div>
      <ProcessingSteps status={status} />
      <SavingsNudge />
      <ExplanationStream text={displayExplanation} isStreaming={isStreaming} />
      <DownloadButton content={explanation} />
    </div>
  );
}
