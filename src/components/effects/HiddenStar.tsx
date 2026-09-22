"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStarCollection, type StarId } from "@/context/StarCollectionContext";
import { useSiteMode } from "@/context/SiteModeContext";
import { useHasMounted } from "@/lib/useHasMounted";

const DEBUG_STORAGE_KEY = "showSurpriseDebug";

/**
 * 개발 환경에서만 다이아 히트 영역에 outline을 그려서 위치를 확인할 수 있게 한다.
 * NODE_ENV 체크가 빌드 타임에 리터럴로 치환되므로, production 빌드에서는 이 분기
 * 전체가 데드코드로 제거되어 절대 노출되지 않는다.
 */
function isDebugDiamondsEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEBUG_STORAGE_KEY) === "true";
}

interface HiddenStarProps {
  id: StarId;
  className?: string;
}

/**
 * 각 페이지마다 하나씩 고정된 위치에 있는 수집용 다이아(HiddenStar는 과거 "별" 시절
 * 이름을 그대로 쓰고 있다). 배경 별들 사이에서도 유심히 보면 "저건 일반 별이 아닌
 *것 같은데?" 정도는 느껴지도록 살짝 더 또렷하게 두고, 은은한 상시 glow와 아주
 * 느린 깜빡임만 준다. 실제 클릭 판정 영역은 시각적 크기보다 넉넉하게 잡아 모바일
 * 에서도 탭하기 쉽게 한다.
 */
export default function HiddenStar({ id, className = "" }: HiddenStarProps) {
  const { isCollected, collectStar } = useStarCollection();
  const { isContributeMode } = useSiteMode();
  const hasMounted = useHasMounted();
  const collected = isCollected(id);
  const [justCollected, setJustCollected] = useState(false);
  const debugEnabled = hasMounted && isDebugDiamondsEnabled();

  // 다이아 수집(SURPRISE로 가는 열쇠)은 정식 공개 전 이스터에그다 - contribute
  // 모드에서는 아예 그리지 않는다.
  if (isContributeMode) return null;

  // 이미 수집한 다이아는 해당 페이지에서 완전히 사라진다(다시 클릭되지 않는다).
  // 개발 debug 모드에서는 위치 확인을 위해 수집 여부와 무관하게 계속 보여준다.
  if (!debugEnabled && collected) return null;

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
      className={`group z-20 flex h-10 w-10 items-center justify-center ${
        collected ? "cursor-default" : "cursor-pointer"
      } ${className}`}
    >
      <motion.svg
        aria-hidden
        viewBox="0 0 24 24"
        width={22}
        height={22}
        className={`text-star ${
          debugEnabled ? "opacity-100" : "drop-shadow-[0_0_4px_rgba(255,230,167,0.5)]"
        } transition-transform duration-500 group-hover:scale-[1.08] group-hover:drop-shadow-[0_0_9px_rgba(255,230,167,0.85)]`}
        animate={debugEnabled ? undefined : { opacity: [0.65, 0.75, 0.65] }}
        transition={{ opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
        whileHover={{ opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }}
      >
        <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" transform="rotate(45 12 12)" />
      </motion.svg>

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
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full border border-dashed border-red-400/70"
        />
      )}
    </button>
  );
}
