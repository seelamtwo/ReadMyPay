"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function ExplanationStream({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  if (!text) return null;

  return (
    <div
      className={cn(
        "prose prose-slate mt-8 max-w-none rounded-xl border border-slate-200 bg-slate-50/80 p-6 prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900",
        isStreaming && "border-emerald-200/80"
      )}
    >
      <ReactMarkdown>{text}</ReactMarkdown>
      {isStreaming && (
        <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-emerald-600" />
      )}
    </div>
  );
}
