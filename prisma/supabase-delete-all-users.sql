-- DANGER: Deletes every user and related auth/app rows. Irreversible.
-- Run in Supabase → SQL Editor (or psql) against the database you intend to wipe.
-- Stripe customers may still exist in the Stripe Dashboard; clean those separately if needed.

-- Sessions, accounts, subscriptions, password reset tokens reference User with ON DELETE CASCADE.
TRUNCATE TABLE "User" CASCADE;

-- VerificationToken rows use email as identifier, not a FK to User.
TRUNCATE TABLE "VerificationToken";

-- If TRUNCATE fails (extra FKs), use instead:
-- DELETE FROM "Session";
-- DELETE FROM "Account";
-- DELETE FROM "PasswordResetToken";
-- DELETE FROM "Subscription";
-- DELETE FROM "User";
-- DELETE FROM "VerificationToken";
