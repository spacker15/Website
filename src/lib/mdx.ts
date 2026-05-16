import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const NEWS_DIR = path.join(process.cwd(), "content", "news");

export type NewsFrontmatter = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  author?: string;
  draft?: boolean;
};

export type NewsPost = NewsFrontmatter & { body: string };

export async function getAllNewsPosts(): Promise<NewsPost[]> {
  let files: string[];
  try {
    files = await fs.readdir(NEWS_DIR);
  } catch {
    return [];
  }
  const posts: NewsPost[] = [];
  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;
    const filePath = path.join(NEWS_DIR, file);
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const fm = data as Partial<NewsFrontmatter>;
    if (!fm.title || !fm.slug || !fm.date || !fm.excerpt) continue;
    if (fm.draft) continue;
    posts.push({
      title: fm.title,
      slug: fm.slug,
      date: fm.date,
      excerpt: fm.excerpt,
      author: fm.author,
      body: content,
    });
  }
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

export async function getNewsPostBySlug(slug: string): Promise<NewsPost | null> {
  const posts = await getAllNewsPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}
