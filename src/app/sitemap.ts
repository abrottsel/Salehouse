import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://zem.plus";

function getVillages(): string[] {
  try {
    return fs
      .readdirSync(path.join(process.cwd(), "public", "villages"))
      .filter((d) => !d.startsWith("."));
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/contacts`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/favorites`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const villagePaths: MetadataRoute.Sitemap = getVillages().map((slug) => ({
    url: `${BASE}/village/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPaths, ...villagePaths];
}
