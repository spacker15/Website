"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteTeam } from "./actions";

export function DeleteTeamButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("Delete this team and its entire roster? This can't be undone.")) {
      return;
    }
    startTransition(async () => {
      const res = await deleteTeam(id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Team deleted.");
      router.push("/manage/teams");
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
      {pending ? "Deleting…" : "Delete team"}
    </Button>
  );
}
