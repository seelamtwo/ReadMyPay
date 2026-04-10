"use client";

import { useCallback, useState } from "react";

export type ExplainArgs = {
  extractedText: string;
  documentType: string;
  isImage: boolean;
  /** Multiple page images (e.g. scanned PDF rendered client-side). */
  imageUrls?: string[];
  /** Original file name for usage history (optional). */
  fileName?: string;
};

export type ExplainOutcome =
  | { kind: "ok" }
  | { kind: "usage_limit" }
  | { kind: "error"; message: string };

export function useExplain() {
  const [explanation, setExplanation] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const explain = useCallback(async (args: ExplainArgs): Promise<ExplainOutcome> => {
    const { extractedText, documentType, isImage, imageUrls, fileName } =
      args;
    setExplanation("");
    setIsStreaming(true);

    const body: Record<string, unknown> = {
      documentType,
      isImage,
      extractedText: imageUrls?.length ? "" : extractedText,
    };
    if (imageUrls?.length) body.imageUrls = imageUrls;
    if (fileName?.trim()) body.fileName = fileName.trim().slice(0, 512);

    let res: Response;
    try {
      res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
    } catch {
      setIsStreaming(false);
      return {
        kind: "error",
        message:
          "Network error. Check your connection and try again.",
      };
    }

    const ct = res.headers.get("content-type") ?? "";

    if (!res.ok) {
      setIsStreaming(false);
      if (res.status === 429 && ct.includes("application/json")) {
        try {
          const j = (await res.json()) as { code?: string; error?: string };
          if (j.code === "USAGE_LIMIT") {
            return { kind: "usage_limit" };
          }
          return {
            kind: "error",
            message: j.error ?? "Usage limit reached.",
          };
        } catch {
          return { kind: "error", message: "Usage limit reached." };
        }
      }
      const msg = await res.text();
      return {
        kind: "error",
        message: msg || res.statusText || "Request failed",
      };
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      setIsStreaming(false);
      return {
        kind: "error",
        message:
          "No response body from server. Try again or check the server logs.",
      };
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          setExplanation(
            (prev) => prev + decoder.decode(value, { stream: true })
          );
        }
      }
      const tail = decoder.decode();
      if (tail) setExplanation((prev) => prev + tail);
    } catch {
      setExplanation((prev) =>
        prev
          ? `${prev}\n\n**Error:** Stream interrupted.`
          : "**Error:** Stream interrupted."
      );
      setIsStreaming(false);
      return { kind: "error", message: "Stream interrupted." };
    } finally {
      setIsStreaming(false);
    }

    return { kind: "ok" };
  }, []);

  const resetExplanation = useCallback(() => {
    setExplanation("");
    setIsStreaming(false);
  }, []);

  return { explain, explanation, isStreaming, resetExplanation };
}
