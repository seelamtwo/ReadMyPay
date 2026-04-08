import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

/** Server-side password rules (signup + password reset). */
export const newPasswordSchema = z
  .string()
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  )
  .regex(/\d/, "Password must include at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must include at least one special character"
  );
