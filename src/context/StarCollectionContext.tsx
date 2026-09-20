"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useHasMounted } from "@/lib/useHasMounted";
import { readSurpriseUnlocked, writeSurpriseUnlocked } from "@/lib/surpriseAccess";
import { resolveDiamondPositions, type DiamondVariant } from "@/lib/diamondPositions";

const STARS_STORAGE_KEY = "wony-surprise-stars";

/** 주요 페이지 7개 - 하나씩 숨겨진 별을 배치한다. */
export const ALL_STAR_IDS = [
  "home",
  "timeline",
  "archive",
  "statistics",
  "letter",
  "fanArt",
  "video",
] as const;

export type StarId = (typeof ALL_STAR_IDS)[number];

interface StarCollectionContextValue {
  collectedStars: StarId[];
  isCollected: (id: StarId) => boolean;
  collectStar: (id: StarId) => void;
  isUnlocked: boolean;
  /** 이 페이지에서 다이아를 어느 후보 위치에 보여줄지. 아직 로드 전이면 null. */
  getDiamondVariant: (id: StarId) => DiamondVariant | null;
  /** 방금 첫 별을 모아서 안내 문구를 보여줘야 하는 순간. 한 번 확인시키면 계속 false로 남는다. */
  firstStarJustFound: boolean;
  dismissFirstStarHint: () => void;
  /** 방금 7개를 다 모아서 축하 연출을 보여줘야 하는 순간. */
  justUnlocked: boolean;
  dismissJustUnlocked: () => void;
}

const StarCollectionContext = createContext<StarCollectionContextValue | null>(null);

function isStarId(value: unknown): value is StarId {
  return typeof value === "string" && (ALL_STAR_IDS as readonly string[]).includes(value);
}

function readStoredStars(): StarId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STARS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStarId);
  } catch {
    return [];
  }
}

function writeStoredStars(stars: StarId[]) {
  try {
    window.localStorage.setItem(STARS_STORAGE_KEY, JSON.stringify(stars));
  } catch {
    // 시크릿 모드 등 localStorage를 쓸 수 없는 환경에서도 이번 세션 안에서는 계속 동작해야 한다.
  }
}

export function StarCollectionProvider({ children }: { children: ReactNode }) {
  const hasMounted = useHasMounted();

  // 서버/최초 클라이언트 렌더는 항상 빈 상태로 맞춰서 hydration mismatch를 피한다.
  // 마운트가 끝난 뒤 첫 렌더에서(렌더 도중 직접, effect 아님) localStorage의 실제 값을
  // 한 번만 채워 넣는다 - "you might not need an effect"가 권장하는 안전한 패턴이다.
  const [collectedStars, setCollectedStars] = useState<StarId[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [diamondPositions, setDiamondPositions] = useState<Record<StarId, DiamondVariant> | null>(
    null
  );
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  if (hasMounted && !hasLoadedFromStorage) {
    setHasLoadedFromStorage(true);
    setCollectedStars(readStoredStars());
    setIsUnlocked(readSurpriseUnlocked());
    setDiamondPositions(resolveDiamondPositions(ALL_STAR_IDS));
  }

  const [firstStarJustFound, setFirstStarJustFound] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const isCollected = useCallback(
    (id: StarId) => collectedStars.includes(id),
    [collectedStars]
  );

  const getDiamondVariant = useCallback(
    (id: StarId) => diamondPositions?.[id] ?? null,
    [diamondPositions]
  );

  const collectStar = useCallback((id: StarId) => {
    setCollectedStars((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeStoredStars(next);

      if (prev.length === 0) {
        setFirstStarJustFound(true);
      }
      if (next.length >= ALL_STAR_IDS.length) {
        writeSurpriseUnlocked();
        setIsUnlocked(true);
        setJustUnlocked(true);
      }
      return next;
    });
  }, []);

  const dismissFirstStarHint = useCallback(() => setFirstStarJustFound(false), []);
  const dismissJustUnlocked = useCallback(() => setJustUnlocked(false), []);

  const value = useMemo(
    () => ({
      collectedStars,
      isCollected,
      collectStar,
      isUnlocked,
      getDiamondVariant,
      firstStarJustFound,
      dismissFirstStarHint,
      justUnlocked,
      dismissJustUnlocked,
    }),
    [
      collectedStars,
      isCollected,
      collectStar,
      isUnlocked,
      getDiamondVariant,
      firstStarJustFound,
      dismissFirstStarHint,
      justUnlocked,
      dismissJustUnlocked,
    ]
  );

  return (
    <StarCollectionContext.Provider value={value}>{children}</StarCollectionContext.Provider>
  );
}

export function useStarCollection() {
  const ctx = useContext(StarCollectionContext);
  if (!ctx) {
    throw new Error("useStarCollection은 StarCollectionProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
