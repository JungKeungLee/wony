// Cloudflare(cloudflare 브랜치) 전용 - Vercel(main)에서는 사용하지 않는다.
// 모든 페이지가 RootLayout의 cookies() 때문에 요청마다 렌더링되므로 ISR 캐시가
// 필요 없다 - 그래서 R2 incremental cache를 붙이지 않는다(유료/결제수단 등록 회피).
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
