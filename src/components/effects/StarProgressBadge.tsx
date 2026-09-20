"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ALL_STAR_IDS, useStarCollection } from "@/context/StarCollectionContext";
import StatusToast from "@/components/ui/StatusToast";

const HINT_MESSAGES = {
  1: "반짝이는 무언가를 발견했어요.",
  2: "다른 곳에도 비슷한 빛이 숨어 있을지도 몰라요.",
} as const;

/**
 * 첫 별을 찾기 전에는 아무것도 보여주지 않다가, 하나라도 모으면 그때부터 작고
 * 은은한 "✦ N / 7" 카운터를 보여준다. SURPRISE 페이지 자체에서는 엔딩의 몰입감을
 * 해치지 않도록 숨긴다.
 */
export default function StarProgressBadge() {
  const pathname = usePathname();
  const { collectedStars, firstStarJustFound, dismissFirstStarHint } = useStarCollection();
  // 첫 힌트는 "발견했어요" -> (잠시 후) "다른 곳에도..." 두 단계로 순서대로 보여준다.
  // 렌더 중 조건부로 한 번만 올려두는 패턴이라 useEffect의 set-state-in-effect 문제가 없다.
  const [hintStage, setHintStage] = useState<0 | 1 | 2>(0);
  if (firstStarJustFound && hintStage === 0) {
    setHintStage(1);
  }

  function handleHintDismiss() {
    if (hintStage === 1) {
      setHintStage(2);
      return;
    }
    setHintStage(0);
    dismissFirstStarHint();
  }

  if (pathname === "/surprise" || collectedStars.length === 0) return null;

  return (
    <>
      <div className="pointer-events-none fixed bottom-4 left-4 z-30 flex items-center gap-1.5 text-[11px] tracking-[0.15em] text-star/70">
        <span aria-hidden>✦</span>
        <span>
          {collectedStars.length} / {ALL_STAR_IDS.length}
        </span>
      </div>

      <StatusToast
        message={hintStage === 1 || hintStage === 2 ? HINT_MESSAGES[hintStage] : null}
        onDismiss={handleHintDismiss}
      />
    </>
  );
}
