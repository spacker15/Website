import { requireUser } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
        Profile
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">
        Your profile
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Update your contact info. Email is managed by your sign-in account.
      </p>
      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
        <ProfileForm
          initial={{
            full_name: user.profile.full_name ?? "",
            phone: user.profile.phone ?? "",
          }}
        />
      </div>
    </div>
  );
}
