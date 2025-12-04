import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export" 제거 - Vercel rewrites를 사용하기 위해 필요
  images: {
    unoptimized: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;