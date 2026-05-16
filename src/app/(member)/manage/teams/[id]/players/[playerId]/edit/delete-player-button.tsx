"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deletePlayer } from "../../actions";

export function DeletePlayerButton({ id, teamId }: { id: string; teamId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function onClick() {
    if (!confirm("Remove this player from the roster?")) return;
    startTransition(async () => {
      const res = await deletePlayer(id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Player removed.");
      router.push(`/manage/teams/${teamId}/players`);
      router.refresh();
    });
  }
  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={onClick}
      className="bg-brand-pink-600 hover:bg-brand-pink-700"
    >
      {pending ? "Removing…" : "Remove player"}
    </Button>
  );
}
