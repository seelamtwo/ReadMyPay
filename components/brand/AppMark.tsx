import { cn } from "@/lib/utils";

/** Product name for nav and auth headers: “Read My” + accent “Pay”. */
export function AppMark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight text-slate-900", className)}>
      Read My <span className="text-emerald-600">Pay</span>
    </span>
  );
}
