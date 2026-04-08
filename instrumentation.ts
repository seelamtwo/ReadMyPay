/** Runs early on Node server startup so bare hostname env vars are fixed for all routes. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/lib/ensure-origin-env");
  }
}
