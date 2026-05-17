import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sponsors, sponsorshipTiers, tierAccent } from "@/lib/sponsors";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "Sponsorship opportunities with Creek's Girls Lacrosse — packages, benefits, and how to get involved.",
};

export default function SponsorsPage() {
  // Group current sponsors by tier, preserving the tier order from JSON.
  const groupedCurrent = sponsorshipTiers
    .map((t) => ({ tier: t.id, name: t.name, list: sponsors.filter((s) => s.tier === t.id) }))
    .filter((g) => g.list.length > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
        Sponsors
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        Sponsor Creek&apos;s Girls Lacrosse
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        Sponsorship helps cover gear, travel, field time, and the program costs
        that keep our girls on the field. In return, your business reaches an
        active, local community of families and fans across the season.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Why sponsor us?
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Community reach",
              body: "Your logo and name in front of dozens of player families, plus everyone who follows the team on social.",
            },
            {
              title: "Year-round visibility",
              body: "Featured on the website all season, in season-end recognition, and at our banquet.",
            },
            {
              title: "Direct impact",
              body: "Every dollar goes back into the program — equipment, travel, and opportunities for the players.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-neutral-200 bg-white p-6"
            >
              <h3 className="font-display text-lg font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-ink-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Sponsorship packages
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Choose the tier that fits your business. Custom packages are welcome
          too — reach out and we&apos;ll work something out.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {sponsorshipTiers.map((tier) => (
            <div
              key={tier.id}
              className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white"
            >
              <div
                className={`bg-gradient-to-br ${tierAccent(tier.id)} px-5 py-4 text-white`}
              >
                <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] opacity-90">
                  {tier.name}
                </p>
                <p className="mt-1 font-display text-2xl font-bold">
                  {tier.amount}
                </p>
              </div>
              <div className="flex flex-1 flex-col px-5 py-5">
                <p className="text-sm text-ink-muted">{tier.tagline}</p>
                <ul className="mt-4 space-y-2 text-sm text-ink">
                  {tier.benefits.map((b) => (
                    <li key={b} className="flex gap-2">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-brand-teal-600"
                        aria-hidden
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-2xl bg-gradient-to-br from-brand-teal-50 via-white to-brand-pink-50 p-8 sm:p-12">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Ready to sponsor?
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Send us a message and we&apos;ll follow up with details, sponsorship
          agreement, and next steps. Custom packages welcome.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/contact">
            <Button size="lg">Contact us about sponsoring</Button>
          </Link>
          <a href="mailto:creeksgirlslacrosse@gmail.com?subject=Sponsorship%20inquiry">
            <Button size="lg" variant="outline">
              Email creeksgirlslacrosse@gmail.com
            </Button>
          </a>
        </div>
      </section>

      {groupedCurrent.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Thank you to our current sponsors
          </h2>
          <div className="mt-8 space-y-10">
            {groupedCurrent.map(({ tier, name, list }) => (
              <div key={tier}>
                <h3 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-ink-subtle">
                  {name}
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((s) => (
                    <a
                      key={s.name}
                      href={s.url ?? "#"}
                      target={s.url ? "_blank" : undefined}
                      rel={s.url ? "noreferrer noopener" : undefined}
                      className="group rounded-xl border border-neutral-200 bg-white p-6 transition-colors hover:border-brand-teal-200"
                    >
                      <h4 className="font-display text-xl font-semibold text-ink group-hover:text-brand-teal-700">
                        {s.name}
                      </h4>
                      {s.description && (
                        <p className="mt-2 text-sm text-ink-muted">
                          {s.description}
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
