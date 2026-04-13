import type { Metadata } from "next";

/** Use on login, dashboard, account, and other pages that should not appear in search results. */
export const noIndexFollow: Metadata["robots"] = {
  index: false,
  follow: true,
};
