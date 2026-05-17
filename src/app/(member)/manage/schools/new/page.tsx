import Link from "next/link";
import { requireProgramLeader } from "@/lib/auth";
import { SchoolForm } from "../school-form";

export const dynamic = "force-dynamic";

export default async function NewSchoolPage() {
  await requireProgramLeader();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link
        href="/manage/schools"
        className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-purple-600"
      >
        ← Back to schools
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
        New school
      </h1>
      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SchoolForm />
      </div>
    </div>
  );
}
