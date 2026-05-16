import Link from "next/link";
import { TeamForm } from "../team-form";

export const metadata = { title: "New team" };

export default function NewTeamPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <Link
        href="/manage/teams"
        className="text-sm font-medium text-brand-teal-700 hover:underline"
      >
        ← Teams
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink">
        New team
      </h1>
      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
        <TeamForm />
      </div>
    </div>
  );
}
