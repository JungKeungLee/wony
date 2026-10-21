import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * public/images/timeline/ 아래 실제로 배포되는 파일 목록(예: "/images/timeline/01/01.webp").
 * data/timeline.ts의 placeholder 경로 중 이 목록에 없는 것은 화면에서 요청하지 않고
 * 곧바로 자리표시를 보여준다(src/lib/timelineImages.ts의 isMissingLocalTimelineImage).
 */
function listShippedTimelineImages(): string[] {
  const root = path.join(process.cwd(), "public", "images", "timeline");
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => "/" + path.relative(path.join(process.cwd(), "public"), path.join(entry.parentPath, entry.name)).split(path.sep).join("/"));
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_LOCAL_TIMELINE_IMAGES: JSON.stringify(listShippedTimelineImages()),
  },
  experimental: {
    // Cloudflare(cloudflare 브랜치) 전용: Next 16.3은 프리페치 묶음 전송(prefetchInlining)이
    // 기본으로 켜져 있는데, OpenNext 1.20.6의 캐시 응답은 이때 세그먼트 프리페치
    // (Next-Router-Segment-Prefetch) 요청에 페이지 전체 RSC를 돌려준다. 브라우저가 이를
    // 받아들이지 못하고 같은 프리페치를 무한히 다시 보내(탭 하나당 분당 70~90건) Workers
    // 무료 한도를 소모하므로 끈다 - 세그먼트별 프리페치는 링크당 한 번씩만 일어난다.
    prefetchInlining: false,
  },
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
