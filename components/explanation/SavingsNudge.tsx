import { Lightbulb } from "lucide-react";

export function SavingsNudge() {
  return (
    <div className="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <Lightbulb className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      <p>
        Tips at the end of each explanation are general suggestions only—not
        personalized financial advice.
      </p>
    </div>
  );
}
