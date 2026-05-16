import type { Metadata } from "next";
import Link from "next/link";
import { getAllNewsPosts } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "News",
  description: "Announcements and updates from Creek's Girls Lacrosse.",
};

export default async function NewsIndexPage() {
  const posts = await getAllNewsPosts();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
        News
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        Latest from the program
      </h1>
      <p className="mt-4 text-ink-muted">
        Announcements, recaps, and program updates.
      </p>

      {posts.length === 0 ? (
        <p className="mt-12 rounded-lg border border-dashed border-neutral-300 p-8 text-center text-ink-muted">
          No posts yet — check back soon.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-neutral-200">
          {posts.map((post) => (
            <li key={post.slug} className="py-6">
              <Link href={`/news/${post.slug}`} className="group block">
                <time className="text-xs uppercase tracking-wider text-ink-subtle">
                  {formatDate(post.date)}
                </time>
                <h2 className="mt-1 font-display text-2xl font-semibold text-ink group-hover:text-brand-teal-700">
                  {post.title}
                </h2>
                <p className="mt-2 text-ink-muted">{post.excerpt}</p>
                <span className="mt-3 inline-block text-sm font-medium text-brand-teal-700 group-hover:underline">
                  Read more →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
