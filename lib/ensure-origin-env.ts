/**
 * Bare hostnames (e.g. www.readmypay.com) in URL env vars break `new URL()` and
 * libraries like Stripe. Prepend https:// for common keys on server startup.
 */
function patchBareOriginEnv(key: string) {
  const v = process.env[key]?.trim();
  if (!v || /^https?:\/\//i.test(v)) return;
  const hostPart = v.replace(/\/+$/, "");
  try {
    const u = new URL(`https://${hostPart}`);
    process.env[key] = `${u.protocol}//${u.host}`;
  } catch {
    /* leave unchanged */
  }
}

if (typeof process !== "undefined" && process.env) {
  for (const k of ["NEXT_PUBLIC_APP_URL", "NEXTAUTH_URL", "AUTH_URL"]) {
    patchBareOriginEnv(k);
  }
}

export {};
