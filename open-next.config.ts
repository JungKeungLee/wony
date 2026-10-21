// Cloudflare(cloudflare 브랜치) 전용 - Vercel(main)에서는 사용하지 않는다.
//
// 페이지는 src/app/[mode]/ 아래에서 contribute/public 두 버전으로 빌드 때 정적 생성되고,
// proxy.ts가 서명 쿠키를 검증한 뒤 내부 rewrite로 둘 중 하나를 고른다.
// - staticAssetsIncrementalCache: 정적 생성된 HTML/RSC를 Workers Static Assets의
//   cdn-cgi/_next_cache(Worker만 읽을 수 있는 경로)에서 읽는다. 읽기 전용·무료
//   (R2/KV 불필요). 페이지 데이터는 브라우저가 Supabase에서 직접 읽으므로 콘텐츠가
//   늘어도 재빌드/재배포가 필요 없다.
// - enableCacheInterception: proxy 실행 뒤 캐시에 있는 페이지는 Next 서버(React SSR)를
//   띄우지 않고 바로 응답한다 - 무료 플랜 CPU 한도 대응의 핵심.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
