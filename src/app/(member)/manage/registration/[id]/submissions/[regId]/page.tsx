import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function fmtDob(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

function computeAge(iso: string | null): number | null {
  if (!iso) return null;
  const dob = new Date(iso);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string; regId: string }>;
}) {
  await requireProgramLeader();
  const { id, regId } = await params;
  const supabase = await createClient();

  const [{ data: reg }, { data: signatures }, { data: teams }] = await Promise.all([
    supabase
      .from("registrations")
      .select("*")
      .eq("id", regId)
      .eq("window_id", id)
      .maybeSingle(),
    supabase
      .from("registration_waivers")
      .select("*")
      .eq("registration_id", regId)
      .order("signed_at"),
    supabase.from("teams").select("id, name"),
  ]);
  if (!reg) notFound();

  const teamName = reg.requested_team_id
    ? ((teams ?? []).find((t) => t.id === reg.requested_team_id)?.name ?? "(deleted)")
    : "—";
  const age = computeAge(reg.player_date_of_birth);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href={`/manage/registration/${id}/submissions`}
        className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-purple-600"
      >
        ← Back to submissions
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
        {reg.player_first_name} {reg.player_last_name}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Submitted {fmtDate(reg.created_at)} · Status:{" "}
        <span className="font-medium capitalize">{reg.status.replace("_", " ")}</span> ·
        Fee ${(reg.fee_cents / 100).toFixed(2)}
      </p>

      <Section title="Player">
        <Pair label="Name" value={`${reg.player_first_name} ${reg.player_last_name}`} />
        <Pair label="Date of birth" value={`${fmtDob(reg.player_date_of_birth)}${age !== null ? ` (age ${age})` : ""}`} />
        <Pair label="Grade" value={reg.player_grade ?? "—"} />
        <Pair label="School" value={reg.player_school ?? "—"} />
        <Pair label="Position preference" value={reg.player_position} />
        <Pair
          label="USA Lacrosse"
          value={
            reg.player_usa_lacrosse_member
              ? `Member${reg.player_usa_lacrosse_number ? ` · #${reg.player_usa_lacrosse_number}` : ""}`
              : "Not a member"
          }
        />
        <Pair
          label="Jersey preferences"
          value={
            [reg.player_jersey_pref_1, reg.player_jersey_pref_2, reg.player_jersey_pref_3]
              .filter(Boolean)
              .join(", ") || "—"
          }
        />
        <Pair label="T-shirt size" value={reg.player_tshirt_size ?? "—"} />
        <Pair label="Pinnie size" value={reg.player_pinnie_size ?? "—"} />
        <Pair label="Years of experience" value={reg.player_years_experience?.toString() ?? "—"} />
        <Pair label="Requested team" value={teamName} />
        <PairBlock label="Medical notes" value={reg.player_medical_notes} />
        <PairBlock label="Notes for coaches" value={reg.notes} />
      </Section>

      <Section title="Primary guardian">
        <Pair label="Name" value={reg.parent_full_name} />
        <Pair label="Relationship" value={reg.parent_relationship ?? "—"} />
        <Pair label="Email" value={reg.parent_email} />
        <Pair label="Phone" value={reg.parent_phone ?? "—"} />
        <Pair
          label="Address"
          value={[
            reg.parent_address_line1,
            reg.parent_address_line2,
            [reg.parent_city, reg.parent_state, reg.parent_zip].filter(Boolean).join(", "),
          ]
            .filter(Boolean)
            .join(" · ") || "—"}
        />
      </Section>

      {(reg.secondary_guardian_full_name ||
        reg.secondary_guardian_email ||
        reg.secondary_guardian_phone) && (
        <Section title="Secondary guardian">
          <Pair label="Name" value={reg.secondary_guardian_full_name ?? "—"} />
          <Pair label="Relationship" value={reg.secondary_guardian_relationship ?? "—"} />
          <Pair label="Email" value={reg.secondary_guardian_email ?? "—"} />
          <Pair label="Phone" value={reg.secondary_guardian_phone ?? "—"} />
        </Section>
      )}

      <Section title="Emergency contact">
        <Pair label="Name" value={reg.emergency_contact_name ?? "—"} />
        <Pair label="Relationship" value={reg.emergency_contact_relationship ?? "—"} />
        <Pair label="Phone" value={reg.emergency_contact_phone ?? "—"} />
      </Section>

      <Section title="Signed waivers">
        {!signatures || signatures.length === 0 ? (
          <p className="text-sm text-ink-muted">No waivers signed.</p>
        ) : (
          <ul className="space-y-3">
            {signatures.map((s) => (
              <li
                key={s.id}
                className="rounded-md border border-neutral-200 bg-white p-3 text-sm"
              >
                <p className="font-medium text-ink">
                  {s.waiver_title_snapshot}{" "}
                  <span className="text-xs text-ink-subtle">v{s.waiver_version}</span>
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Signed by <strong>{s.signed_by_name}</strong> on {fmtDate(s.signed_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <dl className="mt-3 grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-2">
        {children}
      </dl>
    </section>
  );
}

function Pair({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

function PairBlock({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="sm:col-span-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
        {label}
      </dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}
