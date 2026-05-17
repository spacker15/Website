import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FieldForm } from "../field-form";

export const dynamic = "force-dynamic";

export default async function EditRegistrationFieldPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProgramLeader();
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("registration_fields")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link
        href="/manage/registration-fields"
        className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-purple-600"
      >
        ← Back to fields
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
        Edit custom field
      </h1>
      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <FieldForm defaults={data} />
      </div>
    </div>
  );
}
