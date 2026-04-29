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
    sitemap: "https://xn--e1adndpn4g.xn--p1ai/sitemap.xml",
    host: "https://xn--e1adndpn4g.xn--p1ai",
  };
}
