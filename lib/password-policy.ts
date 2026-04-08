/** Shared rules for signup / password validation (client + server). */

export const MIN_PASSWORD_LENGTH = 8;

export function passwordRequirements(password: string) {
  return {
    minLength: password.length >= MIN_PASSWORD_LENGTH,
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export function passwordMeetsPolicy(password: string): boolean {
  const r = passwordRequirements(password);
  return r.minLength && r.hasNumber && r.hasSpecial;
}

/** 0–4 for a 4-segment strength bar. */
export function passwordStrengthSegments(password: string): number {
  if (!password) return 0;
  const r = passwordRequirements(password);
  let n = 0;
  if (r.minLength) n++;
  if (r.hasNumber) n++;
  if (r.hasSpecial) n++;
  if (password.length >= 12) n++;
  else if (/[a-z]/.test(password) && /[A-Z]/.test(password)) n++;
  return Math.min(4, n);
}

export function strengthLabel(segments: number): string {
  if (segments <= 1) return "Weak";
  if (segments === 2) return "Fair";
  if (segments === 3) return "Good";
  return "Strong";
}
