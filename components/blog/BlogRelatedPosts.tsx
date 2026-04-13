import Link from "next/link";
import { getAllBlogPostsMerged } from "@/lib/blog-data";
import { relatedSlugsFor } from "@/lib/blog-related";

type Props = { slug: string };

export async function BlogRelatedPosts({ slug }: Props) {
  const related = relatedSlugsFor(slug);
  if (related.length === 0) return null;

  const posts = await getAllBlogPostsMerged();
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const items = related
    .map((s) => bySlug.get(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (items.length === 0) return null;

  return (
    <section
      className="mt-12 border-t border-slate-200 pt-10"
      aria-labelledby="related-posts-heading"
    >
      <h2
        id="related-posts-heading"
        className="text-lg font-semibold text-slate-900"
      >
        Related reading
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="font-medium text-emerald-800 hover:underline"
            >
              {p.title}
            </Link>
            <p className="mt-1 text-sm text-slate-600">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
