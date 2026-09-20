import type { StarId } from "@/context/StarCollectionContext";

const POSITIONS_STORAGE_KEY = "wony-diamond-positions";

/**
 * 페이지마다 준비해 둔 다이아 후보 위치 3개. 실제 화면 배치는 각 페이지 컴포넌트에서
 * 이 키를 그대로 `variant`로 사용하는 HiddenStar 슬롯 3개로 구현되어 있고, 방문자마다
 * 그중 하나만 무작위로 골라 보이게 한다. 새 후보를 추가/변경하려면 이 배열과 해당
 * 페이지의 HiddenStar 배치를 함께 수정하면 된다.
 */
export const DIAMOND_POSITION_CANDIDATES = {
  home: ["home-hero-stars", "home-subtitle", "home-scroll"],
  timeline: ["timeline-month-number", "timeline-line", "timeline-gallery"],
  archive: ["archive-month-tabs", "archive-month-title", "archive-divider"],
  statistics: ["statistics-number", "statistics-chart", "statistics-heading"],
  letter: ["letter-heading", "letter-cards", "letter-write"],
  fanArt: ["fanart-heading", "fanart-grid", "fanart-bottom"],
  video: ["video-month-tabs", "video-grid", "video-best"],
} as const satisfies Record<StarId, readonly string[]>;

export type DiamondVariant = (typeof DIAMOND_POSITION_CANDIDATES)[StarId][number];

function isValidVariant(id: StarId, value: unknown): value is DiamondVariant {
  return typeof value === "string" && (DIAMOND_POSITION_CANDIDATES[id] as readonly string[]).includes(value);
}

function readStoredPositions(): Partial<Record<StarId, DiamondVariant>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(POSITIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as Partial<Record<StarId, DiamondVariant>>;
  } catch {
    return {};
  }
}

function writeStoredPositions(positions: Record<StarId, DiamondVariant>) {
  try {
    window.localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // 시크릿 모드 등 localStorage를 쓸 수 없는 환경에서도 이번 세션 안에서는 계속 동작해야 한다.
  }
}

function pickRandomVariant(id: StarId): DiamondVariant {
  const candidates = DIAMOND_POSITION_CANDIDATES[id];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * 사람(브라우저)마다 각 페이지의 다이아 위치를 한 번만 무작위로 고정한다. 이미
 * localStorage에 유효한 값이 저장돼 있으면 그대로 쓰고, 없거나 손상된 항목만 새로
 * 뽑아서 채운 뒤 다시 저장한다 - 한 번 정해진 위치는 새로고침/재방문에도 유지된다.
 */
export function resolveDiamondPositions(allIds: readonly StarId[]): Record<StarId, DiamondVariant> {
  const stored = readStoredPositions();
  const next = {} as Record<StarId, DiamondVariant>;
  let changed = false;

  for (const id of allIds) {
    const existing = stored[id];
    if (existing && isValidVariant(id, existing)) {
      next[id] = existing;
    } else {
      next[id] = pickRandomVariant(id);
      changed = true;
    }
  }

  if (changed) writeStoredPositions(next);
  return next;
}
