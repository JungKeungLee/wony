/**
 * WONY 팬사이트 · 참여용 사전 공개(contribute) / 정식 공개(public) 모드 설정.
 *
 * 이 파일이 유일한 기준(source of truth)이다 - 사이트 어디에서도
 * `process.env.NEXT_PUBLIC_SITE_MODE`를 직접 비교하지 말고, 여기서 내보내는
 * 값/상수만 사용한다. middleware.ts(엣지/서버)와 SiteModeContext(클라이언트) 양쪽
 * 모두 이 파일을 그대로 import해서 같은 기준을 공유한다.
 *
 * - contribute: 11월 중순 사전 공개. LETTER/FAN ART/VIDEO 참여 기능만 노출한다.
 * - public: 연말 정식 공개. 현재 만들어진 전체 사이트가 열린다.
 *
 * 전환 방법: Vercel(또는 배포 환경)의 NEXT_PUBLIC_SITE_MODE 값을
 * "contribute" <-> "public"로 바꾸고 재배포하면 된다. 코드 수정은 필요 없다.
 */

export type SiteMode = "contribute" | "public";

/**
 * 배포 환경변수로 정해지는 "기본" 모드(요청/방문자와 무관하게 고정).
 * 값이 정확히 "public"이 아니면 항상 안전한 쪽인 "contribute"로 취급한다
 * (환경변수를 깜빡 설정하지 않았을 때 전체 사이트가 실수로 공개되는 사고를 막기 위함).
 */
export function getBaseSiteMode(): SiteMode {
  return process.env.NEXT_PUBLIC_SITE_MODE === "public" ? "public" : "contribute";
}

/**
 * contribute 모드에서도 항상 열려 있어야 하는 페이지 경로(정확히 일치하는 것만).
 * proxy.ts가 이 배열을 기준으로 그 외 경로를 전부 "/"로 redirect한다.
 * (동적 세그먼트나 새 하위 경로가 생기면 여기에도 추가해야 한다.)
 *
 * /videos/write는 의도적으로 빠져 있다 - VIDEO는 운영자가 미리 등록하고 일반
 * 방문자는 조회·재생·투표만 하는 구조라서다(VideosHero의 "+ 영상 남기기" 버튼도
 * contribute 모드에서는 같은 이유로 숨긴다).
 */
export const CONTRIBUTE_ALLOWED_PATHS: readonly string[] = [
  "/",
  "/letters",
  "/letters/write",
  "/fan-art",
  "/fan-art/write",
  "/videos",
  "/privacy",
  "/content-removal",
];

/** Full Preview 인증에 성공했을 때 심는 쿠키 이름. */
export const PREVIEW_COOKIE_NAME = "wony_full_preview";

/** Full Preview 잠금 해제에 쓰는 query parameter 이름(?previewFull=...). */
export const PREVIEW_QUERY_KEY = "previewFull";
