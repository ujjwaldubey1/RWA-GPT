import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for Vercel deployment
  images: {
    unoptimized: true
  }
};

export default nextConfig;
