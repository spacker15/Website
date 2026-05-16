import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Creek's Girls Lacrosse — our mission, our coaches, and our team.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
        About
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        Creek&apos;s Girls Lacrosse
      </h1>

      {/* TODO: replace placeholder copy with copy from the coaching staff */}
      <section className="prose prose-neutral mt-8 max-w-none text-ink-muted">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Our mission
        </h2>
        <p>
          We&apos;re a community-driven program built on hard work, sportsmanship,
          and joy for the game. Our goal is simple: develop confident
          student-athletes, build life-long friendships, and have fun chasing
          something bigger than ourselves on the field.
        </p>

        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">
          Our team
        </h2>
        <p>
          From middle school to varsity, every level of our program shares the
          same standard — relentless effort, respect for teammates and
          opponents, and pride in representing Creek&apos;s.
        </p>

        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">
          Coaching staff
        </h2>
        <p>
          Bios coming soon. Our staff brings years of playing and coaching
          experience to every practice and game day.
        </p>

        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">
          History
        </h2>
        <p>
          The Creek&apos;s Girls Lacrosse program has been growing year over
          year. Highlights, season recaps, and program milestones will live
          here.
        </p>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/contact">
          <Button size="lg">Get in touch</Button>
        </Link>
        <Link href="/sponsors">
          <Button size="lg" variant="outline">
            Support the program
          </Button>
        </Link>
      </div>
    </div>
  );
}
