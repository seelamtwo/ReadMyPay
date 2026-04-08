import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-slate-600">
          © {new Date().getFullYear()} Read My Pay. General information only—not
          financial advice.
        </p>
        <div className="flex gap-6 text-sm">
          <Link href="/privacy" className="text-slate-600 hover:text-slate-900">
            Privacy
          </Link>
          <Link href="/terms" className="text-slate-600 hover:text-slate-900">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
