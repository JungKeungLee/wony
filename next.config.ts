import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudflare(cloudflare 브랜치) 전용: Workers에는 Vercel 같은 기본 이미지 최적화가
    // 없어서 원본 이미지를 그대로 내려준다(C안). main(Vercel)에는 이 줄이 없다.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
