import Link from "next/link";
import { ArrowRight, Calendar, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { getAllNewsPosts } from "@/lib/mdx";
import { sponsors } from "@/lib/sponsors";

export default async function HomePage() {
  const posts = (await getAllNewsPosts()).slice(0, 3);

  return (
    <>
      <Hero />
      <Highlights />
      <RecentNews posts={posts} />
      <SponsorsStrip />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-teal-50 via-white to-brand-pink-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center md:py-28">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
            Welcome to the home of
          </p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-ink sm:text-6xl">
            Creek&apos;s
            <span className="block text-brand-teal-700">Girls Lacrosse</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-muted">
            Empowering young women through lacrosse — skills, sportsmanship,
            and leadership, on the field and beyond.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/news">
              <Button size="lg" className="gap-2">
                Latest news <ArrowRight size={18} aria-hidden />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Get in touch
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <Logo variant="crest" height={420} priority />
        </div>
      </div>
    </section>
  );
}

function Highlights() {
  const items = [
    {
      icon: Calendar,
      title: "Schedules & RSVPs",
      body: "Per-team calendars, .ics exports, and reminders so no one misses a game.",
    },
    {
      icon: Users,
      title: "Rosters & Profiles",
      body: "Player profiles, parent contacts, and coach communication in one place.",
    },
    {
      icon: Heart,
      title: "Community",
      body: "Volunteer hours, sponsor recognition, and team news — built by our community.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
        Built for our team
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-neutral-200 bg-white p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-teal-50 text-brand-teal-700">
              <Icon size={20} aria-hidden />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">
              {title}
            </h3>
            <p className="mt-2 text-sm text-ink-muted">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentNews({
  posts,
}: {
  posts: Awaited<ReturnType<typeof getAllNewsPosts>>;
}) {
  if (posts.length === 0) return null;
  return (
    <section className="bg-surface-muted py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Latest news
          </h2>
          <Link
            href="/news"
            className="text-sm font-medium text-brand-teal-700 hover:underline"
          >
            All news →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/news/${post.slug}`}
              className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-6 transition-colors hover:border-brand-teal-200"
            >
              <time className="text-xs uppercase tracking-wider text-ink-subtle">
                {formatDate(post.date)}
              </time>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink group-hover:text-brand-teal-700">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-ink-muted">{post.excerpt}</p>
              <span className="mt-4 text-sm font-medium text-brand-teal-700 group-hover:underline">
                Read more →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsorsStrip() {
  const hasSponsors = sponsors.length > 0;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl bg-gradient-to-br from-brand-purple-500 to-brand-teal-600 p-10 text-white sm:p-14">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          {hasSponsors ? "Thank you to our sponsors" : "Sponsor the team"}
        </h2>
        <p className="mt-3 max-w-xl text-white/85">
          {hasSponsors
            ? "Local supporters make our season possible. Visit the sponsors page to see who's backing the team — and how your business can too."
            : "Help us cover gear, travel, and field time. Sponsorship packages reach an active community of families and fans across the season."}
        </p>
        <div className="mt-6">
          <Link href="/sponsors">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-brand-purple-700 hover:bg-brand-pink-50"
            >
              {hasSponsors ? "See our sponsors →" : "See sponsorship packages →"}
            </Button>
          </Link>
        </div>
        {hasSponsors && (
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/85">
            {sponsors.slice(0, 6).map((s) => (
              <li key={s.name}>{s.name}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
