import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export" 제거 - Vercel 배포 시 필요 없음
  // 채팅 앱 같은 동적 사이트는 export 옵션을 꺼야 합니다.
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