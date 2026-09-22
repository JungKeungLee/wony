"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Letter } from "@/lib/types";

/** 카드가 살짝 떠오르는 클릭 피드백을 보여준 뒤 실제로 편지를 여는 시점까지의 지연. */
const LIFT_BEFORE_OPEN_MS = 140;
/** 클릭 시 잠깐 나타났다 사라지는 작은 별빛이 보이는 시간. */
const SPARK_VISIBLE_MS = 550;

interface LetterCardProps {
  letter: Letter;
  delay?: number;
  /** 이 편지가 지금 봉투로 열려있는 중인지 - true면 카드 쪽은 조용히 숨어서
   * shared layout(layoutId)이 봉투와 자리를 주고받는 동안 두 벌이 겹쳐 보이지
   * 않게 한다. */
  isActive: boolean;
  onOpen: () => void;
}

export default function LetterCard({ letter, delay = 0, isActive, onOpen }: LetterCardProps) {
  const from = letter.is_anonymous ? "익명의 팬" : letter.nickname;
  const [showSparks, setShowSparks] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  function handleClick() {
    if (isActive) return;
    setShowSparks(true);
    window.setTimeout(() => setShowSparks(false), SPARK_VISIBLE_MS);
    // 카드가 살짝 뜨는 whileTap 반응을 잠깐 보여준 뒤 편지를 연다 - 바로 팝업이
    // 뜨는 대신 "편지를 살짝 들어 올리는" 순간을 느낄 수 있게 한 박자 늦춘다.
    window.setTimeout(onOpen, LIFT_BEFORE_OPEN_MS);
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={isActive}
      aria-hidden={isActive}
      layoutId={prefersReducedMotion ? undefined : `letter-envelope-${letter.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -3 }}
      whileTap={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      style={{ opacity: isActive ? 0 : undefined, pointerEvents: isActive ? "none" : undefined }}
      className="group relative flex flex-col items-center gap-4 border border-white/10 bg-bg-soft/50 px-6 py-10 text-center shadow-[0_0_0_rgba(255,182,204,0)] transition-opacity duration-200 [transition-property:opacity,border-color,background-color,box-shadow] hover:border-pink/50 hover:bg-bg-soft hover:shadow-[0_10px_26px_rgba(255,182,204,0.14)]"
    >
      <span
        aria-hidden
        className="text-4xl transition-transform duration-300 group-hover:-translate-y-1"
      >
        💌
      </span>
      <span className="font-serif-kr text-sm text-text-soft sm:text-base">
        From. {from}
      </span>

      <AnimatePresence>
        {showSparks && (
          <>
            <motion.span
              key="spark-1"
              aria-hidden
              initial={{ opacity: 0, scale: 0.4, y: 0 }}
              animate={{ opacity: [0, 1, 0], scale: 1, y: -10 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="pointer-events-none absolute left-6 top-4 text-xs text-star"
            >
              ✦
            </motion.span>
            <motion.span
              key="spark-2"
              aria-hidden
              initial={{ opacity: 0, scale: 0.4, y: 0 }}
              animate={{ opacity: [0, 1, 0], scale: 1, y: -8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
              className="pointer-events-none absolute right-7 top-8 text-[10px] text-star/80"
            >
              ✦
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
