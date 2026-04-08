export function PrivacyPill() {
  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
      <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
      <span className="text-xs font-medium text-emerald-800">
        Never stored · Processed in memory only · Deleted after explanation
      </span>
    </div>
  );
}
