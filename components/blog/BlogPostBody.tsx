"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  content: string;
};

/** Renders markdown-ish blog body with shared typography. */
export function BlogPostBody({ content }: Props) {
  return (
    <div className="prose prose-slate mt-8 max-w-none prose-headings:font-semibold prose-a:text-emerald-700">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
