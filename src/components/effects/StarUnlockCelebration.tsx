"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStarCollection } from "@/context/StarCollectionContext";
import { useSiteMode } from "@/context/SiteModeContext";

/** 별 7개를 모두 모은 순간 딱 한 번 뜨는 축하 안내. "[ THE FINAL PAGE ]" 이동 버튼은
 * 여기가 아니라 Footer에 상시 노출되는 쪽에 둔다 (이 모달은 순수 안내용). */
export default function StarUnlockCelebration() {
  const { isContributeMode } = useSiteMode();
  const { justUnlocked, dismissJustUnlocked } = useStarCollection();
  const [phase, setPhase] = useState<"first" | "second">("first");

  // justUnlocked는 별 7개를 다 모은 순간 딱 한 번만 true가 되므로(다시 false로
  // 돌아간 뒤 또 true가 될 일이 없다), phase는 초기값 "first"에서 시작해 여기서
  // "second"로만 한 번 전진시키면 되고 별도로 되돌릴 필요가 없다.
  useEffect(() => {
    if (!justUnlocked) return;
    const timer = setTimeout(() => setPhase("second"), 1600);
    return () => clearTimeout(timer);
  }, [justUnlocked]);

  return (
    <AnimatePresence>
      {!isContributeMode && justUnlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={dismissJustUnlocked}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-w-sm flex-col items-center gap-4 border border-star/30 bg-bg-soft px-8 py-10 text-center"
          >
            <span aria-hidden className="text-2xl text-star">
              ✦
            </span>
            <AnimatePresence mode="wait">
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="font-serif-kr text-base text-text sm:text-lg"
              >
                {phase === "first"
                  ? "모든 빛을 찾았습니다."
                  : "2026년의 마지막 페이지가 열렸습니다 ✦"}
              </motion.p>
            </AnimatePresence>
            <button
              type="button"
              onClick={dismissJustUnlocked}
              className="mt-2 border border-text-soft/40 px-6 py-2 text-xs tracking-[0.15em] text-text-soft transition-colors hover:border-star hover:text-star"
            >
              닫기
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
