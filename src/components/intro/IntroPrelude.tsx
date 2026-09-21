"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface IntroPreludeProps {
  onComplete: () => void;
}

/** StarField/SurpriseOpening과 동일한 골든 앵글 의사난수 - 서버/클라이언트 렌더 결과가 항상 같다. */
function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

const STAR_COUNT = 6;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  left: 20 + pseudoRandom(i * 1.7 + 3) * 60,
  top: 15 + pseudoRandom(i * 2.9 + 8) * 55,
  size: 1 + pseudoRandom(i * 3.3 + 5) * 1.2,
  delay: pseudoRandom(i * 4.1 + 2) * 0.3,
}));

const HOLD_MS = 1500;
const FADE_OUT_MS = 500;
const REDUCED_HOLD_MS = 500;
const REDUCED_FADE_OUT_MS = 200;

/**
 * 오프닝의 가장 처음, Intro Video가 뜨기 전 아주 짧게 보여주는 프렐류드. 사이트에
 * 들어오자마자 곧장 영상이 재생되는 갑작스러움을 줄이기 위한 완충 장치로,
 * 거의 검은 화면 -> 희미한 별빛 몇 개 -> 짧은 문구 순으로 나타났다가 곧바로
 * fade-out되고 영상으로 이어진다. fade-in/fade-out을 포함한 전체 길이는 약 2초다.
 */
export default function IntroPrelude({ onComplete }: IntroPreludeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const holdMs = prefersReducedMotion ? REDUCED_HOLD_MS : HOLD_MS;
    const fadeMs = prefersReducedMotion ? REDUCED_FADE_OUT_MS : FADE_OUT_MS;
    const hideTimer = setTimeout(() => setHiding(true), holdMs);
    const doneTimer = setTimeout(onComplete, holdMs + fadeMs);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: hiding ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: (prefersReducedMotion ? REDUCED_FADE_OUT_MS : FADE_OUT_MS) / 1000,
        ease: "easeInOut",
      }}
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black"
    >
      {!prefersReducedMotion &&
        STARS.map((star, i) => (
          <motion.span
            key={i}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            transition={{ duration: 0.7, delay: star.delay, ease: "easeOut" }}
            className="absolute rounded-full bg-star"
            style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size }}
          />
        ))}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={
          prefersReducedMotion ? { duration: 0.25 } : { duration: 0.5, delay: 0.35, ease: "easeOut" }
        }
        className="font-serif-kr px-6 text-center text-sm tracking-[0.05em] text-text-soft sm:text-base"
      >
        2026년의 어느 겨울밤...
      </motion.p>
    </motion.div>
  );
}
