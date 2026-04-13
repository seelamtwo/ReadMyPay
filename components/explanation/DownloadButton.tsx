"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadButton({ content }: { content: string }) {
  if (!content || content.startsWith("**Error:**")) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-4"
      onClick={() => {
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "read-my-pay-explanation.txt";
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      <Download className="h-4 w-4" />
      Download as text
    </Button>
  );
}
