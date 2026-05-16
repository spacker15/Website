import type { Metadata } from "next";
import Link from "next/link";
import { sponsors, type Sponsor } from "../../../../content/sponsors";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "Local sponsors and partners who support Creek's Girls Lacrosse.",
};

const tierOrder: Sponsor["tier"][] = ["platinum", "gold", "silver", "supporter"];

export default function SponsorsPage() {
  const grouped = tierOrder
    .map((tier) => ({ tier, list: sponsors.filter((s) => s.tier === tier) }))
    .filter((g) => g.list.length > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
        Sponsors
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        Thank you to our supporters
      </h1>
      <p className="mt-4 max-w-2xl text-ink-muted">
        Local businesses and families that make our season possible. Interested
        in sponsoring the team?{" "}
        <Link href="/contact" className="text-brand-teal-700 hover:underline">
          Get in touch
        </Link>
        .
      </p>

      {grouped.length === 0 ? (
        <p className="mt-12 rounded-lg border border-dashed border-neutral-300 p-8 text-center text-ink-muted">
          Sponsor list coming soon.
        </p>
      ) : (
        <div className="mt-12 space-y-12">
          {grouped.map(({ tier, list }) => (
            <section key={tier}>
              <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-ink-subtle">
                {tier}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => (
                  <a
                    key={s.name}
                    href={s.url ?? "#"}
                    target={s.url ? "_blank" : undefined}
                    rel={s.url ? "noreferrer noopener" : undefined}
                    className="group rounded-xl border border-neutral-200 bg-white p-6 transition-colors hover:border-brand-teal-200"
                  >
                    <h3 className="font-display text-xl font-semibold text-ink group-hover:text-brand-teal-700">
                      {s.name}
                    </h3>
                    {s.description && (
                      <p className="mt-2 text-sm text-ink-muted">{s.description}</p>
                    )}
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-16 rounded-2xl bg-gradient-to-br from-brand-teal-50 to-brand-pink-50 p-8 sm:p-12">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Want to sponsor the team?
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          We&apos;d love to talk. Sponsorship helps cover equipment, travel, and
          program costs — and gets your business in front of an active local
          community.
        </p>
        <div className="mt-6">
          <Link href="/contact">
            <Button size="lg">Contact us about sponsoring</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
