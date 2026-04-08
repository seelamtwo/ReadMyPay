-- Read My Pay — fix Supabase linter: rls_disabled_in_public + sensitive_columns_exposed
-- Run once in Supabase → SQL Editor (Dashboard → SQL → New query).
--
-- These tables are only used by Next.js + Prisma over the database connection string.
-- They must NOT be readable via the Supabase Data API (anon / publishable key).
--
-- After this: anon + authenticated have no table privileges; RLS is on with no policies
-- for those roles → API cannot read rows. Prisma still works (postgres / owner bypasses RLS).

-- Block PostgREST / client access
REVOKE ALL ON TABLE public."User" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Account" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Session" FROM anon, authenticated;
REVOKE ALL ON TABLE public."VerificationToken" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Subscription" FROM anon, authenticated;
REVOKE ALL ON TABLE public."PasswordResetToken" FROM anon, authenticated;

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PasswordResetToken" ENABLE ROW LEVEL SECURITY;

-- Optional: if you add a non-superuser Prisma role later, either:
--   ALTER ROLE prisma BYPASSRLS;
--   or add explicit RLS policies for that role.
