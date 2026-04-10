"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

/**
 * Shows /admin only after the server confirms allowlisted session (GET /api/admin/session).
 */
export function AdminNavLink() {
  const { status } = useSession();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setVisible(false);
      return;
    }
    let cancelled = false;
    void fetch("/api/admin/session", { credentials: "include" })
      .then((res) => {
        if (!cancelled) setVisible(res.ok);
      })
      .catch(() => {
        if (!cancelled) setVisible(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  if (!visible) return null;

  return (
    <Link href="/admin">
      <Button variant="ghost" size="sm">
        Admin
      </Button>
    </Link>
  );
}
