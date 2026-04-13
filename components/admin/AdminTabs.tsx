"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminBlogPanel } from "@/components/admin/AdminBlogPanel";

type TabId = "overview" | "blog";

type Props = {
  overview: React.ReactNode;
};

export function AdminTabs({ overview }: Props) {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div>
      <div
        className="flex flex-wrap gap-2 border-b border-slate-200 pb-3"
        role="tablist"
        aria-label="Admin sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "overview"}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "overview"
              ? "bg-emerald-100 text-emerald-900"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "blog"}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "blog"
              ? "bg-emerald-100 text-emerald-900"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
          onClick={() => setTab("blog")}
        >
          Blog
        </button>
      </div>

      <div
        className="mt-6"
        role="tabpanel"
        hidden={tab !== "overview"}
        aria-hidden={tab !== "overview"}
      >
        {overview}
      </div>

      <div
        className="mt-6"
        role="tabpanel"
        hidden={tab !== "blog"}
        aria-hidden={tab !== "blog"}
      >
        {tab === "blog" ? <AdminBlogPanel /> : null}
      </div>
    </div>
  );
}
