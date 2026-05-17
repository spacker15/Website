"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { revokeRole } from "./actions";

type Grant = {
  id: string;
  role: string;
  team_id: string | null;
  created_at: string;
  profile_email: string;
  team_name: string | null;
};

export function GrantsTable({ grants }: { grants: Grant[] }) {
  if (grants.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-ink-muted">
        No grants yet. Add one above.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-ink-muted">
        <tr>
          <th className="px-4 py-2">User</th>
          <th className="px-4 py-2">Role</th>
          <th className="px-4 py-2">Scope</th>
          <th className="px-4 py-2 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-200">
        {grants.map((g) => (
          <Row key={g.id} grant={g} />
        ))}
      </tbody>
    </table>
  );
}

function Row({ grant }: { grant: Grant }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onRevoke() {
    if (!confirm(`Revoke ${grant.role.replace("_", " ")} from ${grant.profile_email}?`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await revokeRole(grant.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <tr>
      <td className="px-4 py-3 font-medium text-ink">{grant.profile_email}</td>
      <td className="px-4 py-3 text-ink">
        {grant.role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      </td>
      <td className="px-4 py-3 text-ink-muted">
        {grant.team_name ?? "Site-wide"}
      </td>
      <td className="px-4 py-3 text-right">
        {error && (
          <span className="mr-2 text-xs text-brand-pink-700">{error}</span>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRevoke}
          disabled={pending}
        >
          {pending ? "…" : "Revoke"}
        </Button>
      </td>
    </tr>
  );
}
