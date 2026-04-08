"use client";

import { useCallback, useState } from "react";

type ExplainArgs = {
  extractedText: string;
  documentType: string;
  isImage: boolean;
  /** Multiple page images (e.g. scanned PDF rendered client-side). */
  imageUrls?: string[];
};

export function useExplain() {
  const [explanation, setExplanation] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const explain = useCallback(async (args: ExplainArgs) => {
    const { extractedText, documentType, isImage, imageUrls } = args;
    setExplanation("");
    setIsStreaming(true);

    const body: Record<string, unknown> = {
      documentType,
      isImage,
      extractedText: imageUrls?.length ? "" : extractedText,
    };
    if (imageUrls?.length) body.imageUrls = imageUrls;

    let res: Response;
    try {
      res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
    } catch {
      setExplanation(
        "**Error:** Network error. Check your connection and try again."
      );
      setIsStreaming(false);
      return;
    }

    if (!res.ok) {
      const msg = await res.text();
      setExplanation(`**Error:** ${msg || res.statusText || "Request failed"}`);
      setIsStreaming(false);
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      setExplanation(
        "**Error:** No response body from server. Try again or use `npm run dev` and check the terminal for errors."
      );
      setIsStreaming(false);
      return;
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
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const resetExplanation = useCallback(() => {
    setExplanation("");
    setIsStreaming(false);
  }, []);

  return { explain, explanation, isStreaming, resetExplanation };
}
