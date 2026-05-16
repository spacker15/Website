import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllNewsPosts, getNewsPostBySlug } from "@/lib/mdx";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const posts = await getAllNewsPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href="/news"
        className="text-sm font-medium text-brand-teal-700 hover:underline"
      >
        ← All news
      </Link>
      <time className="mt-6 block text-xs uppercase tracking-wider text-ink-subtle">
        {formatDate(post.date)}
        {post.author ? ` · ${post.author}` : ""}
      </time>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        {post.title}
      </h1>
      <p className="mt-4 text-lg text-ink-muted">{post.excerpt}</p>
      <div className="prose prose-neutral mt-10 max-w-none text-ink prose-headings:font-display prose-headings:text-ink prose-a:text-brand-teal-700">
        <MDXRemote source={post.body} />
      </div>
    </article>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
