import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zemexx.ru",
      },
      {
        protocol: "http",
        hostname: "zemexx.ru",
      },
    ],
  },
};

export default nextConfig;
