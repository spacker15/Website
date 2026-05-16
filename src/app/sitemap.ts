import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllNewsPosts } from "@/lib/mdx";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllNewsPosts();
  const now = new Date();
  const base = siteConfig.url;
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/news`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/sponsors`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
  const newsRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/news/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));
  return [...staticRoutes, ...newsRoutes];
}
