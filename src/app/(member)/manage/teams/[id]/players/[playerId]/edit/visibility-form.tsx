"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateVisibility } from "../../actions";

type Visibility = {
  show_name: boolean;
  show_jersey: boolean;
  show_position: boolean;
  show_grade: boolean;
  show_photo: boolean;
  show_parents: boolean;
};

const FIELDS: { key: keyof Visibility; label: string }[] = [
  { key: "show_name", label: "Name" },
  { key: "show_jersey", label: "Jersey number" },
  { key: "show_position", label: "Position" },
  { key: "show_grade", label: "Grade" },
  { key: "show_photo", label: "Photo" },
  { key: "show_parents", label: "Parent contacts" },
];

export function VisibilityForm({
  playerId,
  initial,
}: {
  playerId: string;
  initial: Visibility;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [v, setV] = useState<Visibility>(initial);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateVisibility({ player_id: playerId, ...v });
      if (res.ok) {
        toast.success("Visibility saved.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map(({ key, label }) => (
          <Switch
            key={key}
            label={label}
            checked={v[key]}
            onChange={(e) => setV((s) => ({ ...s, [key]: e.target.checked }))}
          />
        ))}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save visibility"}
      </Button>
    </form>
  );
}
