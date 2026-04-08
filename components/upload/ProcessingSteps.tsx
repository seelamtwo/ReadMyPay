"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "extracting" | "rasterizing" | "explaining";

export function ProcessingSteps({ status }: { status: Status }) {
  if (status === "idle") return null;

  const readDone = status === "explaining";
  const readActive = status === "extracting" || status === "rasterizing";
  const explainActive = status === "explaining";

  return (
    <ol className="mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-600">
      <li
        className={cn(
          "flex items-center gap-2",
          readActive && "font-medium text-emerald-700"
        )}
      >
        {readDone ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : readActive ? (
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
        ) : (
          <span className="h-4 w-4 rounded-full border border-slate-300" />
        )}
        {status === "rasterizing"
          ? "Render pages for vision"
          : "Read document"}
      </li>
      <li
        className={cn(
          "flex items-center gap-2",
          explainActive && "font-medium text-emerald-700"
        )}
      >
        {explainActive ? (
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
        ) : (
          <span className="h-4 w-4 rounded-full border border-slate-300" />
        )}
        Plain-English explanation
      </li>
    </ol>
  );
}
