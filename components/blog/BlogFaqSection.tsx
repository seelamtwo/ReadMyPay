import { getBlogFaqs } from "@/lib/blog-faq-schema";

type Props = { slug: string };

/**
 * Visible FAQ block (JSON-LD is separate). Matches data in `lib/blog-faq-schema.ts`.
 */
export function BlogFaqSection({ slug }: Props) {
  const items = getBlogFaqs(slug);
  if (items.length === 0) return null;

  return (
    <section
      className="mt-12 border-t border-slate-200 pt-10"
      aria-labelledby="blog-faq-heading"
    >
      <h2
        id="blog-faq-heading"
        className="text-xl font-semibold tracking-tight text-slate-900"
      >
        Frequently asked questions
      </h2>
      <div className="mt-6 space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="rounded-lg border border-slate-200 bg-white shadow-sm open:bg-slate-50/80"
          >
            <summary className="cursor-pointer px-4 py-3 font-medium text-slate-900 marker:text-emerald-700">
              {item.question}
            </summary>
            <div className="border-t border-slate-100 px-4 pb-4 pt-1 text-[0.9375rem] leading-relaxed text-slate-700 sm:pl-9">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
