import type { FooterLink, NavItem } from "./types";
import { getBaseSiteMode } from "./siteMode";

export const NAV_ITEMS: NavItem[] = [
  { label: "HOME", href: "/" },
  { label: "TIMELINE", href: "/timeline" },
  { label: "ARCHIVE", href: "/archive" },
  { label: "STATISTICS", href: "/statistics" },
  { label: "LETTER", href: "/letters" },
  { label: "FAN ART", href: "/fan-art" },
  { label: "VIDEO", href: "/videos" },
  // CONCERT 임시 비활성화 - /concert 페이지 자체도 접근을 막아뒀다(siteMode.ts,
  // src/app/concert/page.tsx 참고). 다시 열 때 이 줄의 주석만 풀면 된다.
  // { label: "CONCERT", href: "/concert" },
];

export const INTRO_LINES: string[] = [
  "2026년에도",
  "많은 순간들이 있었습니다.",
  "웃었던 순간도 있었고",
  "아쉬웠던 순간도 있었습니다.",
  "그리고 그 모든 순간에",
  "워니가 있었습니다.",
];

/**
 * Hero 배경 이미지 경로. 값을 채우면 Hero가 next/image로 렌더링하고,
 * null이면 임시 그라디언트 배경을 사용한다.
 */
export const HERO_BACKGROUND_IMAGE: string | null = "/images/hero/main.png";

/**
 * 배경 이미지에서 주요 피사체가 위치한 지점. PC/모바일에서 인물·풍경이
 * 잘리지 않도록 이미지 교체 시 이 값만 조정하면 된다. (CSS object-position 값)
 */
export const HERO_IMAGE_FOCAL_POINT = "center";

/**
 * 사이트 첫 진입 오프닝 영상 경로("문자 도착 → 워니가 휴대폰을 확인" 장면만 담당).
 * 파일이 없거나 재생에 실패해도 Intro는 스마트폰 단계로 자연스럽게 건너뛴다.
 */
export const INTRO_VIDEO_SRC = "/video/wony-intro.mp4";

/**
 * SURPRISE 페이지 맨 마지막(진짜 엔딩) 영상 경로. 실제 파일은
 * public/video/surprise-ending.mp4(INTRO_VIDEO_SRC와 같은 폴더)에 있다 - "videos"가
 * 아니라 "video" 단수형이니 착각하지 않는다. 파일이 없거나 재생에 실패해도 사이트
 * 동작에는 영향이 없다(그 구간을 그냥 넘어간다).
 */
export const SURPRISE_ENDING_VIDEO_SRC = "/video/surprise-ending.mp4";

/**
 * contribute(참여용 사전 공개) 모드의 참여 기간 표시 문구. 화면에는
 * "참여 기간 {start} ~ {end}"처럼 작게만 보여준다. 날짜가 바뀌면 이 두 값만
 * 바꾸면 된다.
 */
export const CONTRIBUTE_DEADLINE = {
  start: "2026.11.01",
  end: "2026.12.01",
};

/**
 * VIDEO 페이지의 "☆ 이 영상에 한 표" 버튼(성공 메시지, 투표 관련 안내 문구 등
 * 투표 UI 전체)을 보여줄지 여부.
 *
 * - contribute 모드(NEXT_PUBLIC_SITE_MODE=contribute): 사전 공개 기간 동안의
 *   참여 기능이라 기본적으로 켜진다.
 * - public 모드(NEXT_PUBLIC_SITE_MODE=public, 연말 정식 공개): 투표 기간이
 *   끝난 것으로 보고 항상 꺼진다. video_votes에 이미 쌓인 데이터는 지우지 않고
 *   그대로 두며(운영자가 BEST 선정에 계속 참고할 수 있도록), 화면에서 투표
 *   UI만 숨긴다.
 *
 * NEXT_PUBLIC_VIDEO_VOTING_ENABLED="false"로 두면 contribute 모드 중에도 수동으로
 * 끌 수 있다(둘 중 하나라도 꺼짐 조건이면 숨김).
 */
export const VIDEO_VOTING_ENABLED =
  getBaseSiteMode() === "contribute" && process.env.NEXT_PUBLIC_VIDEO_VOTING_ENABLED !== "false";

/**
 * 페이지별 배경음악 경로.
 * - DEFAULT_BGM_SRC: 일반 페이지(HOME/TIMELINE/ARCHIVE/STATISTICS/LETTER/FAN ART/VIDEO)
 * - SURPRISE_BGM_SRC: /surprise 전용
 */
export const DEFAULT_BGM_SRC = "/audio/Before_the_Snow_Melts.mp3";
export const SURPRISE_BGM_SRC = "/audio/decembers-quiet-turning.mp3";

/** 배경음악 기본 볼륨 (0~1). 두 트랙 모두 동일하게 적용된다. 사용자가 직접 조절하면 localStorage에 저장되어 이 값을 덮어쓴다. */
export const DEFAULT_BGM_VOLUME = 0.18;

/**
 * Footer에 노출할 공식/관련 채널 링크.
 * href가 아직 없으면 null로 두고, Footer는 이를 클릭 불가능한 placeholder로 표시한다.
 * 실제 주소가 정해지면 이 값만 채우면 된다.
 */
export const FOOTER_SOCIAL_LINKS: FooterLink[] = [
  { label: "FAN CAFE", href: "https://cafe.naver.com/nanwony" },
  { label: "SOOP", href: "https://www.sooplive.com/station/whiteone325" },
  { label: "YOUTUBE", href: "https://www.youtube.com/channel/UCrwytjkxPAjHKdM8h6kYQ8Q" },
];

/**
 * Footer 하단의 약관성 링크. 아직 실제 페이지는 없지만,
 * 나중에 해당 경로에 페이지만 추가하면 되도록 구조를 미리 잡아둔다.
 */
export const FOOTER_LEGAL_LINKS: FooterLink[] = [
  { label: "개인정보 처리 안내", href: "/privacy" },
  { label: "콘텐츠 삭제 요청", href: "/content-removal" },
];

/** 콘텐츠 삭제/수정 요청 등 문의를 받는 이메일. 나중에 이 값만 바꾸면 된다. */
export const CONTACT_EMAIL = "ahsjdkfl1042@gmail.com";
