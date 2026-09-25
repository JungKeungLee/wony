"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useHasMounted } from "@/lib/useHasMounted";

/** StarField/SurpriseOpening과 동일한 골든 앵글 의사난수 - 서버/클라이언트 렌더가 항상 같다. */
function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

const STAR_COUNT = 8;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  left: pseudoRandom(i * 1.7 + 3) * 100,
  top: pseudoRandom(i * 2.9 + 8) * 100,
  size: 1 + pseudoRandom(i * 3.3 + 5) * 1.3,
  delay: pseudoRandom(i * 4.1 + 2) * 0.4,
}));

/**
 * /awards 진입 시 아주 짧게(약 2.2~2.8초) 재생되는 오프닝. 어두운 네이비 배경 ->
 * 희미한 별빛 + 은은한 금빛 spotlight -> "WONY / AWARDS / 2026" -> 짧은 태그라인 ->
 * 작은 캡션 순으로 나타난 뒤 스스로 fade-out되며 사라진다. SurpriseOpening과 달리
 * 뒤에 있는 본문이 이미 마운트돼 있고, 이 오프닝은 그 위에 잠깐 얹히는 오버레이일
 * 뿐이라 onComplete 콜백 없이 스스로 마운트/언마운트를 관리한다.
 */
export default function AwardsOpening() {
  const prefersReducedMotion = useReducedMotion();
  const [hiding, setHiding] = useState(false);
  const [mounted, setMounted] = useState(true);
  const hasMounted = useHasMounted();
  const showStars = hasMounted && !prefersReducedMotion;

  // 오프닝이 떠 있는 동안은 뒤에 있는 수상 발표 본문을 미리 스크롤해서 볼 수 없게 막는다.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const hideDelay = prefersReducedMotion ? 200 : 2200;
    const unmountDelay = prefersReducedMotion ? 500 : 2800;
    const hideTimer = window.setTimeout(() => setHiding(true), hideDelay);
    const unmountTimer = window.setTimeout(() => setMounted(false), unmountDelay);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [prefersReducedMotion]);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: hiding ? 0 : 1 }}
      transition={{ duration: prefersReducedMotion ? 0.3 : 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-bg"
    >
      {showStars &&
        STARS.map((star, i) => (
          <motion.span
            key={i}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.8, delay: star.delay, ease: "easeOut" }}
            className="absolute rounded-full bg-star"
            style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size }}
          />
        ))}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,230,167,0.12),transparent_60%)]"
      />

      <div className="relative flex flex-col items-center gap-4 px-6 text-center">
        <div className="flex flex-col items-center gap-1">
          {["WONY", "AWARDS", "2026"].map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.3 }
                  : { duration: 0.5, delay: i * 0.12, ease: "easeOut" }
              }
              className="font-display text-3xl tracking-[0.2em] text-text sm:text-5xl"
            >
              {word}
            </motion.span>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            prefersReducedMotion ? { duration: 0.3 } : { duration: 0.6, delay: 0.55, ease: "easeOut" }
          }
          className="font-serif-kr text-sm text-text-soft sm:text-base"
        >
          2026년,
          <br />
          가장 빛났던 순간들.
        </motion.p>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            prefersReducedMotion ? { duration: 0.3 } : { duration: 0.6, delay: 0.85, ease: "easeOut" }
          }
          className="font-display text-[10px] tracking-[0.4em] text-star/80"
        >
          WONY AWARDS 2026
        </motion.span>
      </div>
    </motion.div>
  );
}
