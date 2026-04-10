import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Compliance note; per-user actions live in AdminUsersTable. */
export function AdminOperationsPanel() {
  return (
    <Card className="mt-6 border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">Audit</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-600">
        <p>
          Every admin action above is written to{" "}
          <code className="rounded bg-slate-100 px-1">AdminAuditLog</code> in
          the database. API access requires the same{" "}
          <code className="rounded bg-slate-100 px-1">ADMIN_EMAILS</code>{" "}
          allowlist as this page.
        </p>
      </CardContent>
    </Card>
  );
}
