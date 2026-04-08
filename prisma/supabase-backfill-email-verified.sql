-- One-time migration after enabling email verification for password accounts.
-- Run in Supabase → SQL Editor (or psql) once before/after deploy so existing users
-- are not redirected to /verify-email indefinitely.
--
-- Option A — only users who already set a password (typical legacy email/password signups):
UPDATE "User"
SET "emailVerified" = NOW()
WHERE "hashedPassword" IS NOT NULL
  AND "emailVerified" IS NULL;

-- Option B — if any OAuth or other rows have NULL "emailVerified" and should be treated as verified:
-- UPDATE "User"
-- SET "emailVerified" = NOW()
-- WHERE "emailVerified" IS NULL;
