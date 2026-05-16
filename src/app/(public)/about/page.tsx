import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Creek's Girls Lacrosse — empowering young women through the sport of lacrosse.",
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

      <section className="prose prose-neutral mt-8 max-w-none text-ink-muted prose-headings:font-display prose-headings:text-ink prose-strong:text-ink">
        <p className="lead text-lg">
          Creek&apos;s Girls Lacrosse is a program dedicated to empowering young
          women through the sport of lacrosse. We firmly believe in fostering
          essential lacrosse skills while instilling the values of sportsmanship
          and leadership — benefiting our players not only on the field but
          also in their future endeavors.
        </p>

        <p>
          Creek&apos;s Girls Lacrosse is open to girls of all skill levels,
          whether you&apos;re a beginner or an experienced player. Our program
          provides a supportive and inclusive environment for every participant
          to learn, grow, and excel.
        </p>

        <p>
          We prioritize not just the game of lacrosse but also the personal
          development of our players. Through teamwork, respect, and leadership
          opportunities, we aim to nurture well-rounded individuals who will
          thrive both in sports and in life.
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
