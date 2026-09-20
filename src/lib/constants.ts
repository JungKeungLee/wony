import type { FooterLink, NavItem, PreviewItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { label: "HOME", href: "/" },
  { label: "TIMELINE", href: "/timeline" },
  { label: "ARCHIVE", href: "/archive" },
  { label: "STATISTICS", href: "/statistics" },
  { label: "LETTER", href: "/letters" },
  { label: "FAN ART", href: "/fan-art" },
  { label: "VIDEO", href: "/videos" },
];

export const INTRO_LINES: string[] = [
  "2026년에도",
  "많은 순간들이 있었습니다.",
  "웃었던 순간도 있었고",
  "아쉬웠던 순간도 있었습니다.",
  "그리고 그 모든 순간에",
  "워니가 있었습니다.",
];

export const PREVIEW_ITEMS: PreviewItem[] = [
  {
    index: "01",
    title: "2026 TIMELINE",
    description: "우리의 2026년을 다시 걸어봅니다.",
    href: "/timeline",
  },
  {
    index: "02",
    title: "LETTERS",
    description: "워니에게 전하지 못했던 이야기",
    href: "/letters",
  },
  {
    index: "03",
    title: "FAN ART",
    description: "팬들의 마음으로 완성된 또 하나의 워니",
    href: "/fan-art",
  },
  {
    index: "04",
    title: "WONY CINEMA",
    description: "2026년 우리의 순간을 영상으로",
    href: "/videos",
  },
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
 * 배경음악 파일 경로. 실제 음원이 추가되기 전까지는 null로 두고
 * MusicProvider는 UI 상태만 토글한다.
 */
export const BGM_SRC: string | null = null;

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
