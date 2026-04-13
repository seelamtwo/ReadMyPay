"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  seoKeywords: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  published: boolean;
  publishedAt: string;
};

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  slug: "",
  seoKeywords: "",
  seoTitle: "",
  seoDescription: "",
  published: true,
};

export function AdminBlogPanel() {
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrationHint, setMigrationHint] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/blog", { credentials: "include" });
      const data = (await res.json()) as {
        posts?: BlogRow[];
        error?: string;
        migrationRequired?: boolean;
      };
      if (!res.ok) {
        setError(data.error ?? `Load failed (${res.status})`);
        return;
      }
      setPosts(data.posts ?? []);
      setMigrationHint(
        data.migrationRequired && data.error ? data.error : null
      );
    } catch {
      setError("Could not load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(p: BlogRow) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      slug: p.slug,
      seoKeywords: p.seoKeywords ?? "",
      seoTitle: p.seoTitle ?? "",
      seoDescription: p.seoDescription ?? "",
      published: p.published,
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        slug: form.slug.trim() || undefined,
        seoKeywords: form.seoKeywords.trim() || undefined,
        seoTitle: form.seoTitle.trim() || undefined,
        seoDescription: form.seoDescription.trim() || undefined,
        published: form.published,
      };

      const url = editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Save failed (${res.status})`);
        return;
      }
      startNew();
      await load();
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this post? It will disappear from the public blog.")) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Delete failed");
        return;
      }
      if (editingId === id) startNew();
      await load();
    } catch {
      setError("Delete failed.");
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading blog posts…</p>;
  }

  return (
    <div className="space-y-8">
      {migrationHint && (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          {migrationHint}
        </p>
      )}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {editingId ? "Edit post" : "New post"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Markdown-style body (headings, bold, lists). SEO fields feed meta tags
          and the public blog listing.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4 max-w-3xl">
        <div className="space-y-2">
          <Label htmlFor="blog-title">Title</Label>
          <Input
            id="blog-title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            maxLength={512}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-excerpt">Excerpt</Label>
          <textarea
            id="blog-excerpt"
            value={form.excerpt}
            onChange={(e) =>
              setForm((f) => ({ ...f, excerpt: e.target.value }))
            }
            required
            rows={3}
            className={cn(
              "flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
              "resize-y"
            )}
            placeholder="Short summary for listings and meta description fallback"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-content">Content</Label>
          <textarea
            id="blog-content"
            value={form.content}
            onChange={(e) =>
              setForm((f) => ({ ...f, content: e.target.value }))
            }
            required
            rows={16}
            className={cn(
              "flex min-h-[320px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
              "resize-y font-mono"
            )}
            placeholder={"## Heading\n\nBody text…"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-slug">URL slug (optional)</Label>
          <Input
            id="blog-slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="auto from title if empty"
            maxLength={320}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-seo-kw">SEO keywords</Label>
          <Input
            id="blog-seo-kw"
            value={form.seoKeywords}
            onChange={(e) =>
              setForm((f) => ({ ...f, seoKeywords: e.target.value }))
            }
            placeholder="comma separated, e.g. pay stub, net pay, deductions"
            maxLength={1024}
          />
          <p className="text-xs text-slate-500">
            Used for the meta keywords tag and as supplemental signals in Open Graph.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-seo-title">SEO title override (optional)</Label>
          <Input
            id="blog-seo-title"
            value={form.seoTitle}
            onChange={(e) =>
              setForm((f) => ({ ...f, seoTitle: e.target.value }))
            }
            placeholder="Defaults to post title"
            maxLength={512}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-seo-desc">SEO description override (optional)</Label>
          <textarea
            id="blog-seo-desc"
            value={form.seoDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, seoDescription: e.target.value }))
            }
            rows={2}
            className={cn(
              "flex min-h-[64px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
              "resize-y"
            )}
            placeholder="Defaults to excerpt"
            maxLength={8000}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="blog-published"
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm((f) => ({ ...f, published: e.target.checked }))
            }
            className="h-4 w-4 rounded border-slate-300"
          />
          <Label htmlFor="blog-published" className="font-normal">
            Published (visible on public blog)
          </Label>
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Update post" : "Publish post"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={startNew}>
              Cancel edit
            </Button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-base font-semibold text-slate-900">All posts (database)</h3>
        <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
          {posts.length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-600">
              No posts yet. Create one above.
            </li>
          ) : (
            posts.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{p.title}</p>
                  <p className="text-xs text-slate-500">
                    /blog/{p.slug} ·{" "}
                    {p.published ? (
                      <span className="text-emerald-700">published</span>
                    ) : (
                      <span className="text-amber-800">draft</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(p)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-800 hover:bg-red-50"
                    onClick={() => void remove(p.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
