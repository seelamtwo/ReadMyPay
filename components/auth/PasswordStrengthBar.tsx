"use client";

import { cn } from "@/lib/utils";
import {
  passwordStrengthSegments,
  strengthLabel,
  passwordRequirements,
  MIN_PASSWORD_LENGTH,
} from "@/lib/password-policy";

export function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;

  const segments = passwordStrengthSegments(password);
  const label = strengthLabel(segments);
  const req = passwordRequirements(password);

  const activeColor =
    segments <= 1
      ? "bg-red-500"
      : segments === 2
        ? "bg-amber-500"
        : segments === 3
          ? "bg-yellow-500"
          : "bg-emerald-600";

  return (
    <div className="space-y-2">
      <div className="flex gap-1" role="meter" aria-valuenow={segments} aria-valuemin={0} aria-valuemax={4} aria-label={`Password strength: ${label}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < segments ? activeColor : "bg-slate-200"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-slate-600">
        Strength: <span className="font-medium text-slate-800">{label}</span>
      </p>
      <ul className="space-y-1 text-xs text-slate-600">
        <li className={req.minLength ? "text-emerald-700" : ""}>
          {req.minLength ? "✓" : "○"} At least {MIN_PASSWORD_LENGTH} characters
        </li>
        <li className={req.hasNumber ? "text-emerald-700" : ""}>
          {req.hasNumber ? "✓" : "○"} At least one number
        </li>
        <li className={req.hasSpecial ? "text-emerald-700" : ""}>
          {req.hasSpecial ? "✓" : "○"} At least one special character
        </li>
      </ul>
    </div>
  );
}
