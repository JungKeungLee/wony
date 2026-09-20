"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStarCollection, type StarId } from "@/context/StarCollectionContext";
import type { DiamondVariant } from "@/lib/diamondPositions";
import { useHasMounted } from "@/lib/useHasMounted";

const DEBUG_STORAGE_KEY = "showSurpriseDebug";

/**
 * 개발 환경에서만 다이아 후보 위치를 전부 보이게 해서 확인할 수 있게 한다. NODE_ENV
 * 체크가 빌드 타임에 리터럴로 치환되므로, production 빌드에서는 이 분기 전체가
 * 데드코드로 제거되어 절대 노출되지 않는다.
 */
function isDebugDiamondsEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEBUG_STORAGE_KEY) === "true";
}

interface HiddenStarProps {
  id: StarId;
  /** 이 슬롯이 어느 후보 위치인지. 방문자에게 실제로 배정된 위치와 일치할 때만 보인다. */
  variant: DiamondVariant;
  className?: string;
}

/**
 * 각 페이지마다 준비된 3개의 후보 위치 중, 이 방문자에게 무작위로 배정된 위치의
 * 슬롯에서만 실제로 렌더링되는 수집용 다이아(HiddenStar는 과거 "별" 시절 이름을
 * 그대로 쓰고 있다). 평소에는 배경 별들 사이에 자연스럽게 섞이도록 흐리게 두고,
 * hover 시에만 밝아지며 은은한 glow로 힌트를 준다. 실제 클릭 판정 영역은 시각적
 * 크기보다 넉넉하게 잡아 모바일에서도 탭하기 쉽게 한다.
 */
export default function HiddenStar({ id, variant, className = "" }: HiddenStarProps) {
  const { isCollected, collectStar, getDiamondVariant } = useStarCollection();
  const hasMounted = useHasMounted();
  const collected = isCollected(id);
  const [justCollected, setJustCollected] = useState(false);
  const debugEnabled = hasMounted && isDebugDiamondsEnabled();
  const isAssignedSlot = getDiamondVariant(id) === variant;

  // 실사용자에게는 이 방문자에게 배정된 후보 위치 하나만, 그것도 아직 못 찾았을
  // 때만 보인다. 개발 debug 모드에서는 배정/수집 여부와 무관하게 위치 확인을 위해
  // 항상 렌더링한다.
  if (!debugEnabled && (!isAssignedSlot || collected)) return null;

  function handleClick() {
    if (collected) return;
    setJustCollected(true);
    collectStar(id);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={collected}
      aria-hidden={collected || undefined}
      aria-label={collected ? undefined : "숨겨진 빛"}
      tabIndex={collected ? -1 : 0}
      className={`group z-20 flex h-9 w-9 items-center justify-center ${
        collected ? "cursor-default" : "cursor-pointer"
      } ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        width={18}
        height={18}
        className={`text-star transition-all duration-500 ${
          debugEnabled
            ? "opacity-100"
            : "opacity-50 drop-shadow-[0_0_3px_rgba(255,230,167,0.35)] group-hover:scale-[1.08] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,230,167,0.6)]"
        }`}
      >
        <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" transform="rotate(45 12 12)" />
      </svg>

      <AnimatePresence>
        {justCollected && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0.9, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2.4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => setJustCollected(false)}
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-star"
          >
            ✦
          </motion.span>
        )}
      </AnimatePresence>

      {debugEnabled && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full border border-dashed border-red-400/70"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 whitespace-nowrap border border-dashed border-red-400/70 bg-bg/90 px-1.5 py-0.5 text-center text-[9px] leading-tight text-red-300"
          >
            DIAMOND
            <br />
            {variant}
          </span>
        </>
      )}
    </button>
  );
}
