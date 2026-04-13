import OpenAI from "openai";

/**
 * Server-only. Reads `OPENAI_API_KEY` (trimmed). Use in Node API routes only.
 */
export function requireOpenAiApiKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Set the server env var OPENAI_API_KEY (not NEXT_PUBLIC_*). " +
        "On Vercel: Project → Settings → Environment Variables → check Production, add OPENAI_API_KEY, then redeploy."
    );
  }
  return key;
}

export function createOpenAI(): OpenAI {
  return new OpenAI({ apiKey: requireOpenAiApiKey() });
}
