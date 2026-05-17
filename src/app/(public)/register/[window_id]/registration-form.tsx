"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError } from "@/components/ui/field";
import { submitRegistration } from "./actions";
import { AddressBlock, type Address, emptyAddress } from "./address-block";
import { SchoolSelect } from "./school-select";
import { CustomFieldsBlock, type CustomAnswers } from "./custom-fields";
import type { RegistrationField, School } from "@/lib/supabase/types";

type Team = { id: string; name: string; season: string | null };

type Waiver = {
  id: string;
  title: string;
  body: string;
  version: number;
  is_required: boolean;
  display_order: number;
};

type ParentDefaults = {
  full_name: string;
  email: string;
  phone: string;
};

const POSITIONS = [
  { value: "unspecified", label: "No preference" },
  { value: "attack", label: "Attack" },
  { value: "midfield", label: "Midfield" },
  { value: "defense", label: "Defense" },
  { value: "goalie", label: "Goalie" },
] as const;

const SIZES = ["YS", "YM", "YL", "AS", "AM", "AL", "AXL", "AXXL"] as const;

const RELATIONSHIPS = [
  "Mother", "Father", "Stepmother", "Stepfather", "Guardian",
  "Grandparent", "Aunt", "Uncle", "Sibling", "Other",
] as const;

function computeAge(dobString: string): number | null {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age >= 0 && age < 100 ? age : null;
}

export function RegistrationForm({
  windowId,
  teams,
  waivers,
  schools,
  customFields,
  parentDefaults,
}: {
  windowId: string;
  teams: Team[];
  waivers: Waiver[];
  schools: School[];
  customFields: RegistrationField[];
  parentDefaults: ParentDefaults;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Primary guardian address (we control it as state so "same as primary"
  // checkboxes on the other sections can mirror it).
  const [primaryAddress, setPrimaryAddress] = useState<Address>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
  });

  // Secondary guardian
  const [secondaryAddress, setSecondaryAddress] = useState<Address>({ ...emptyAddress });
  const [secondarySameAsPrimary, setSecondarySameAsPrimary] = useState(false);

  // Emergency contact
  const [emergencyAddress, setEmergencyAddress] = useState<Address>({ ...emptyAddress });
  const [emergencySameAsPrimary, setEmergencySameAsPrimary] = useState(true);

  // Schools
  const [currentSchoolId, setCurrentSchoolId] = useState("");
  const [currentSchoolOther, setCurrentSchoolOther] = useState("");
  const [zonedSchoolId, setZonedSchoolId] = useState("");
  const [zonedSchoolOther, setZonedSchoolOther] = useState("");

  // Player misc
  const [dob, setDob] = useState("");
  const [usaMember, setUsaMember] = useState(false);

  // Custom fields
  const [customAnswers, setCustomAnswers] = useState<CustomAnswers>({});

  // Waivers
  const [signedWaivers, setSignedWaivers] = useState<Record<string, boolean>>({});

  const age = useMemo(() => computeAge(dob), [dob]);
  const requiredWaivers = waivers.filter((w) => w.is_required);
  const missingSignatures = requiredWaivers.filter((w) => !signedWaivers[w.id]);

  // Resolve which address to actually send for each secondary section.
  const effectiveSecondaryAddress = secondarySameAsPrimary
    ? primaryAddress
    : secondaryAddress;
  const effectiveEmergencyAddress = emergencySameAsPrimary
    ? primaryAddress
    : emergencyAddress;

  function setCustomAnswer(key: string, value: string | number | boolean) {
    setCustomAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleWaiver(id: string, checked: boolean) {
    setSignedWaivers((s) => ({ ...s, [id]: checked }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (missingSignatures.length > 0) {
      setError(`Please sign: ${missingSignatures.map((w) => w.title).join(", ")}`);
      return;
    }

    // Validate "Not listed" schools have a name
    if (currentSchoolId === "__other__" && !currentSchoolOther.trim()) {
      setError("Type your current school name.");
      return;
    }
    if (zonedSchoolId === "__other__" && !zonedSchoolOther.trim()) {
      setError("Type your zoned high school name.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const yearsRaw = String(fd.get("player_years_experience") ?? "").trim();
    const signatures = waivers
      .filter((w) => signedWaivers[w.id])
      .map((w) => ({
        waiver_id: w.id,
        version: w.version,
        title: w.title,
        body: w.body,
      }));

    startTransition(async () => {
      const res = await submitRegistration({
        window_id: windowId,
        parent_full_name: String(fd.get("parent_full_name") ?? "").trim(),
        parent_phone: String(fd.get("parent_phone") ?? "").trim(),
        parent_relationship: String(fd.get("parent_relationship") ?? "").trim(),
        parent_address_line1: primaryAddress.line1.trim(),
        parent_address_line2: primaryAddress.line2.trim(),
        parent_city: primaryAddress.city.trim(),
        parent_state: primaryAddress.state.trim(),
        parent_zip: primaryAddress.zip.trim(),
        secondary_guardian_full_name: String(fd.get("secondary_guardian_full_name") ?? "").trim(),
        secondary_guardian_email: String(fd.get("secondary_guardian_email") ?? "").trim(),
        secondary_guardian_phone: String(fd.get("secondary_guardian_phone") ?? "").trim(),
        secondary_guardian_relationship: String(fd.get("secondary_guardian_relationship") ?? "").trim(),
        secondary_guardian_address: {
          line1: effectiveSecondaryAddress.line1.trim(),
          line2: effectiveSecondaryAddress.line2.trim(),
          city: effectiveSecondaryAddress.city.trim(),
          state: effectiveSecondaryAddress.state.trim(),
          zip: effectiveSecondaryAddress.zip.trim(),
        },
        emergency_contact_name: String(fd.get("emergency_contact_name") ?? "").trim(),
        emergency_contact_phone: String(fd.get("emergency_contact_phone") ?? "").trim(),
        emergency_contact_relationship: String(fd.get("emergency_contact_relationship") ?? "").trim(),
        emergency_contact_address: {
          line1: effectiveEmergencyAddress.line1.trim(),
          line2: effectiveEmergencyAddress.line2.trim(),
          city: effectiveEmergencyAddress.city.trim(),
          state: effectiveEmergencyAddress.state.trim(),
          zip: effectiveEmergencyAddress.zip.trim(),
        },
        player_first_name: String(fd.get("player_first_name") ?? "").trim(),
        player_last_name: String(fd.get("player_last_name") ?? "").trim(),
        player_date_of_birth: dob,
        player_grade: String(fd.get("player_grade") ?? "").trim(),
        current_school_id: currentSchoolId === "__other__" ? "" : currentSchoolId,
        current_school_other: currentSchoolId === "__other__" ? currentSchoolOther.trim() : "",
        zoned_high_school_id: zonedSchoolId === "__other__" ? "" : zonedSchoolId,
        zoned_high_school_other: zonedSchoolId === "__other__" ? zonedSchoolOther.trim() : "",
        player_position: String(fd.get("player_position") ?? "unspecified") as
          | "unspecified" | "attack" | "midfield" | "defense" | "goalie",
        player_usa_lacrosse_member: usaMember,
        player_usa_lacrosse_number: usaMember
          ? String(fd.get("player_usa_lacrosse_number") ?? "").trim()
          : "",
        player_jersey_pref_1: String(fd.get("player_jersey_pref_1") ?? "").trim(),
        player_jersey_pref_2: String(fd.get("player_jersey_pref_2") ?? "").trim(),
        player_jersey_pref_3: String(fd.get("player_jersey_pref_3") ?? "").trim(),
        player_tshirt_size: String(fd.get("player_tshirt_size") ?? "").trim(),
        player_pinnie_size: String(fd.get("player_pinnie_size") ?? "").trim(),
        player_years_experience: yearsRaw === "" ? null : Number(yearsRaw),
        player_medical_notes: String(fd.get("player_medical_notes") ?? "").trim(),
        requested_team_id: String(fd.get("requested_team_id") ?? "") || null,
        notes: String(fd.get("notes") ?? "").trim(),
        custom_field_answers: customAnswers,
        signed_by_name: String(fd.get("signed_by_name") ?? "").trim(),
        waiver_signatures: signatures,
      });
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <FormSection title="Primary guardian">
        <Field>
          <Label htmlFor="parent_full_name">Your full name</Label>
          <Input
            id="parent_full_name"
            name="parent_full_name"
            required
            maxLength={120}
            defaultValue={parentDefaults.full_name}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="parent_email">Email</Label>
            <Input
              id="parent_email"
              type="email"
              value={parentDefaults.email}
              disabled
            />
            <p className="mt-1 text-xs text-ink-subtle">
              Receipts and updates go here.
            </p>
          </Field>
          <Field>
            <Label htmlFor="parent_phone">Phone</Label>
            <Input
              id="parent_phone"
              name="parent_phone"
              type="tel"
              required
              maxLength={40}
              defaultValue={parentDefaults.phone}
              placeholder="(555) 123-4567"
            />
          </Field>
        </div>

        <Field>
          <Label htmlFor="parent_relationship">Relationship to player</Label>
          <select
            id="parent_relationship"
            name="parent_relationship"
            required
            defaultValue=""
            className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Choose one…
            </option>
            {RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>

        <AddressBlock
          idPrefix="parent_address"
          value={primaryAddress}
          onChange={setPrimaryAddress}
          required
        />
      </FormSection>

      <FormSection
        title="Secondary guardian (optional)"
        subtitle="Add a second parent or guardian if you'd like them on the contact list."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="secondary_guardian_full_name">Full name</Label>
            <Input
              id="secondary_guardian_full_name"
              name="secondary_guardian_full_name"
              maxLength={120}
            />
          </Field>
          <Field>
            <Label htmlFor="secondary_guardian_relationship">Relationship</Label>
            <select
              id="secondary_guardian_relationship"
              name="secondary_guardian_relationship"
              defaultValue=""
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="secondary_guardian_email">Email</Label>
            <Input
              id="secondary_guardian_email"
              name="secondary_guardian_email"
              type="email"
              maxLength={200}
            />
          </Field>
          <Field>
            <Label htmlFor="secondary_guardian_phone">Phone</Label>
            <Input
              id="secondary_guardian_phone"
              name="secondary_guardian_phone"
              type="tel"
              maxLength={40}
            />
          </Field>
        </div>

        <SameAsPrimaryToggle
          checked={secondarySameAsPrimary}
          onChange={setSecondarySameAsPrimary}
          label="Address is the same as primary guardian"
        />
        <AddressBlock
          idPrefix="secondary_address"
          value={secondarySameAsPrimary ? primaryAddress : secondaryAddress}
          onChange={setSecondaryAddress}
          disabled={secondarySameAsPrimary}
        />
      </FormSection>

      <FormSection
        title="Emergency contact"
        subtitle="Someone other than the primary guardian we can call if we can't reach you."
      >
        <Field>
          <Label htmlFor="emergency_contact_name">Full name</Label>
          <Input
            id="emergency_contact_name"
            name="emergency_contact_name"
            required
            maxLength={120}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="emergency_contact_phone">Phone</Label>
            <Input
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              type="tel"
              required
              maxLength={40}
            />
          </Field>
          <Field>
            <Label htmlFor="emergency_contact_relationship">Relationship</Label>
            <select
              id="emergency_contact_relationship"
              name="emergency_contact_relationship"
              required
              defaultValue=""
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              <option value="" disabled>Choose one…</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
        </div>

        <SameAsPrimaryToggle
          checked={emergencySameAsPrimary}
          onChange={setEmergencySameAsPrimary}
          label="Address is the same as primary guardian"
        />
        <AddressBlock
          idPrefix="emergency_address"
          value={emergencySameAsPrimary ? primaryAddress : emergencyAddress}
          onChange={setEmergencyAddress}
          disabled={emergencySameAsPrimary}
        />
      </FormSection>

      <FormSection title="Player">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="player_first_name">First name</Label>
            <Input id="player_first_name" name="player_first_name" required maxLength={80} />
          </Field>
          <Field>
            <Label htmlFor="player_last_name">Last name</Label>
            <Input id="player_last_name" name="player_last_name" required maxLength={80} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="player_date_of_birth">Date of birth</Label>
            <Input
              id="player_date_of_birth"
              name="player_date_of_birth"
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            {age !== null && (
              <p className="mt-1 text-xs text-ink-subtle">Age: {age}</p>
            )}
          </Field>
          <Field>
            <Label htmlFor="player_grade">Grade in fall</Label>
            <Input
              id="player_grade"
              name="player_grade"
              required
              maxLength={20}
              placeholder="9th"
            />
          </Field>
        </div>

        <SchoolSelect
          idPrefix="current_school"
          label="Current school"
          schools={schools}
          value={currentSchoolId}
          otherValue={currentSchoolOther}
          onChange={setCurrentSchoolId}
          onOtherChange={setCurrentSchoolOther}
          required
        />

        <SchoolSelect
          idPrefix="zoned_high_school"
          label="Zoned high school"
          schools={schools}
          value={zonedSchoolId}
          otherValue={zonedSchoolOther}
          onChange={setZonedSchoolId}
          onOtherChange={setZonedSchoolOther}
          highSchoolOnly
          required
          helpText="The public or private high school the player is zoned for."
        />

        <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={usaMember}
              onChange={(e) => setUsaMember(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            <span className="font-medium text-ink">
              Player is a USA Lacrosse member
            </span>
          </label>
          {usaMember && (
            <Field>
              <Label htmlFor="player_usa_lacrosse_number">USA Lacrosse member number</Label>
              <Input
                id="player_usa_lacrosse_number"
                name="player_usa_lacrosse_number"
                maxLength={40}
                placeholder="1234567"
              />
            </Field>
          )}
        </div>

        <Field>
          <Label htmlFor="player_position">Position preference</Label>
          <select
            id="player_position"
            name="player_position"
            defaultValue="unspecified"
            className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </Field>

        <div>
          <p className="text-sm font-medium text-ink">Jersey number preferences</p>
          <p className="text-xs text-ink-subtle">
            Top 3 choices in order of preference (optional).
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <Field>
              <Label htmlFor="player_jersey_pref_1">1st choice</Label>
              <Input id="player_jersey_pref_1" name="player_jersey_pref_1" maxLength={10} placeholder="7" />
            </Field>
            <Field>
              <Label htmlFor="player_jersey_pref_2">2nd choice</Label>
              <Input id="player_jersey_pref_2" name="player_jersey_pref_2" maxLength={10} />
            </Field>
            <Field>
              <Label htmlFor="player_jersey_pref_3">3rd choice</Label>
              <Input id="player_jersey_pref_3" name="player_jersey_pref_3" maxLength={10} />
            </Field>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="player_tshirt_size">T-shirt size</Label>
            <select
              id="player_tshirt_size"
              name="player_tshirt_size"
              required
              defaultValue=""
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              <option value="" disabled>Choose…</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field>
            <Label htmlFor="player_pinnie_size">Pinnie size</Label>
            <select
              id="player_pinnie_size"
              name="player_pinnie_size"
              required
              defaultValue=""
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              <option value="" disabled>Choose…</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field>
          <Label htmlFor="player_years_experience">Years of experience</Label>
          <Input
            id="player_years_experience"
            name="player_years_experience"
            type="number"
            min="0"
            max="30"
            className="sm:max-w-[160px]"
            placeholder="0"
          />
        </Field>

        <Field>
          <Label htmlFor="player_medical_notes">
            Medical conditions, allergies, or medications (optional)
          </Label>
          <Textarea
            id="player_medical_notes"
            name="player_medical_notes"
            rows={3}
            maxLength={4000}
            placeholder="Asthma — uses an inhaler. Peanut allergy. Etc."
          />
        </Field>

        {teams.length > 0 && (
          <Field>
            <Label htmlFor="requested_team_id">Team (if known)</Label>
            <select
              id="requested_team_id"
              name="requested_team_id"
              defaultValue=""
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">— Let the coaches decide —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.season ? ` (${t.season})` : ""}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field>
          <Label htmlFor="notes">Notes for the coaches (optional)</Label>
          <Textarea id="notes" name="notes" rows={3} maxLength={2000} />
        </Field>
      </FormSection>

      {customFields.length > 0 && (
        <FormSection
          title="Additional info"
          subtitle="A few extra questions from the program."
        >
          <CustomFieldsBlock
            fields={customFields}
            answers={customAnswers}
            onChange={setCustomAnswer}
          />
        </FormSection>
      )}

      {waivers.length > 0 && (
        <FormSection
          title="Waivers and signature"
          subtitle="Read each waiver and check the box. Your typed name below acts as your electronic signature for all of them."
        >
          <div className="space-y-4">
            {waivers.map((w) => (
              <div key={w.id} className="rounded-lg border border-neutral-200 bg-white">
                <div className="border-b border-neutral-200 px-4 py-3">
                  <p className="font-display text-sm font-semibold text-ink">
                    {w.title}
                    {w.is_required ? (
                      <span className="ml-2 rounded-full bg-brand-pink-50 px-2 py-0.5 text-xs font-medium text-brand-pink-700">
                        Required
                      </span>
                    ) : (
                      <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-ink-muted">
                        Optional
                      </span>
                    )}
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto whitespace-pre-wrap px-4 py-3 text-sm text-ink">
                  {w.body}
                </div>
                <label className="flex items-start gap-2 border-t border-neutral-200 bg-surface-muted px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={!!signedWaivers[w.id]}
                    onChange={(e) => toggleWaiver(w.id, e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300"
                  />
                  <span>
                    I have read and agree to the <strong>{w.title}</strong>.
                  </span>
                </label>
              </div>
            ))}
          </div>

          <Field>
            <Label htmlFor="signed_by_name">Type your full legal name to sign</Label>
            <Input
              id="signed_by_name"
              name="signed_by_name"
              required
              maxLength={120}
              placeholder="Jane Q. Parent"
            />
            <p className="mt-1 text-xs text-ink-subtle">
              This counts as your electronic signature on every waiver you
              checked above.
            </p>
          </Field>
        </FormSection>
      )}

      {error && <FieldError>{error}</FieldError>}

      <div className="border-t border-neutral-200 pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Submitting…" : "Submit registration"}
        </Button>
        <p className="mt-3 text-xs text-ink-subtle">
          You&apos;ll be asked to pay the registration fee on the next step.
        </p>
      </div>
    </form>
  );
}

function SameAsPrimaryToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-neutral-300"
      />
      <span>{label}</span>
    </label>
  );
}

function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
