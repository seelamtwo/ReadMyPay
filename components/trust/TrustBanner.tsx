import { Shield } from "lucide-react";

export function TrustBanner() {
  return (
    <div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 text-center text-sm text-emerald-900">
      <span className="inline-flex items-center justify-center gap-2 font-medium">
        <Shield className="h-4 w-4" aria-hidden />
        Privacy-first: your document and explanation are not stored on our servers.
      </span>
    </div>
  );
}
