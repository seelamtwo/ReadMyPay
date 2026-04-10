/** sessionStorage keys for resuming after Stripe checkout. */

export const PENDING_EXPLAIN_KEY = "readmypay:pendingExplain";
export const PENDING_EXPLAIN_OVERSIZED_KEY = "readmypay:pendingExplainOversized";
export const PENDING_SPENDING_KEY = "readmypay:pendingSpending";
export const PENDING_SPENDING_OVERSIZED_KEY = "readmypay:pendingSpendingOversized";

/** ~4.5MB guard — sessionStorage quota varies by browser. */
const MAX_STORE = 4_500_000;

export type PendingExplainPayload = {
  extractedText: string;
  documentType: string;
  isImage: boolean;
  imageUrls?: string[];
  fileName?: string;
};

export type PendingSpendingPayload = {
  documents?: { name: string; text: string }[];
  imageGroups?: { name: string; urls: string[] }[];
};

export function savePendingExplain(payload: PendingExplainPayload): {
  ok: boolean;
  oversized: boolean;
} {
  if (typeof sessionStorage === "undefined") {
    return { ok: false, oversized: true };
  }
  try {
    const raw = JSON.stringify(payload);
    if (raw.length > MAX_STORE) {
      sessionStorage.setItem(PENDING_EXPLAIN_OVERSIZED_KEY, "1");
      sessionStorage.removeItem(PENDING_EXPLAIN_KEY);
      return { ok: false, oversized: true };
    }
    sessionStorage.setItem(PENDING_EXPLAIN_KEY, raw);
    sessionStorage.removeItem(PENDING_EXPLAIN_OVERSIZED_KEY);
    return { ok: true, oversized: false };
  } catch {
    sessionStorage.setItem(PENDING_EXPLAIN_OVERSIZED_KEY, "1");
    sessionStorage.removeItem(PENDING_EXPLAIN_KEY);
    return { ok: false, oversized: true };
  }
}

export function loadPendingExplain(): PendingExplainPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  if (sessionStorage.getItem(PENDING_EXPLAIN_OVERSIZED_KEY) === "1") {
    return null;
  }
  const raw = sessionStorage.getItem(PENDING_EXPLAIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingExplainPayload;
  } catch {
    return null;
  }
}

export function clearPendingExplain(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PENDING_EXPLAIN_KEY);
  sessionStorage.removeItem(PENDING_EXPLAIN_OVERSIZED_KEY);
}

export function savePendingSpending(payload: PendingSpendingPayload): {
  ok: boolean;
  oversized: boolean;
} {
  if (typeof sessionStorage === "undefined") {
    return { ok: false, oversized: true };
  }
  try {
    const raw = JSON.stringify(payload);
    if (raw.length > MAX_STORE) {
      sessionStorage.setItem(PENDING_SPENDING_OVERSIZED_KEY, "1");
      sessionStorage.removeItem(PENDING_SPENDING_KEY);
      return { ok: false, oversized: true };
    }
    sessionStorage.setItem(PENDING_SPENDING_KEY, raw);
    sessionStorage.removeItem(PENDING_SPENDING_OVERSIZED_KEY);
    return { ok: true, oversized: false };
  } catch {
    sessionStorage.setItem(PENDING_SPENDING_OVERSIZED_KEY, "1");
    sessionStorage.removeItem(PENDING_SPENDING_KEY);
    return { ok: false, oversized: true };
  }
}

export function loadPendingSpending(): PendingSpendingPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  if (sessionStorage.getItem(PENDING_SPENDING_OVERSIZED_KEY) === "1") {
    return null;
  }
  const raw = sessionStorage.getItem(PENDING_SPENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingSpendingPayload;
  } catch {
    return null;
  }
}

export function clearPendingSpending(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PENDING_SPENDING_KEY);
  sessionStorage.removeItem(PENDING_SPENDING_OVERSIZED_KEY);
}
