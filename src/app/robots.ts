import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/preview", "/preview-"],
      },
    ],
    sitemap: "https://prozemplus.ru/sitemap.xml",
    host: "https://prozemplus.ru",
  };
}
