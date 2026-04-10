import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
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
