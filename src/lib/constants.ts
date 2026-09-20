import type { NavItem, PreviewItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { label: "HOME", href: "/" },
  { label: "TIMELINE", href: "/timeline" },
  { label: "LETTER", href: "/letters" },
  { label: "FAN ART", href: "/fan-art" },
  { label: "VIDEO", href: "/videos" },
  { label: "MEMORY", href: "/memories" },
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
