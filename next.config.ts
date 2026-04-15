import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Next.js 15+ restricts allowed quality values; defaults to only [75].
    // Explicitly allow the qualities used across the codebase.
    qualities: [50, 60, 70, 75, 80, 85, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "zemexx.ru",
      },
      {
        protocol: "https",
        hostname: "zemexx.ru",
      },
    ],
  },
};

export default nextConfig;
