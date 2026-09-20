"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useHasMounted } from "@/lib/useHasMounted";

interface SurpriseOpeningProps {
  onComplete: () => void;
}

/** StarField와 동일한 골든 앵글 의사난수 - 서버/클라이언트 렌더 결과가 항상 같다. */
function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

const STAR_COUNT = 10;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  left: pseudoRandom(i * 1.7 + 3) * 100,
  top: pseudoRandom(i * 2.9 + 8) * 100,
  size: 1 + pseudoRandom(i * 3.3 + 5) * 1.4,
  delay: pseudoRandom(i * 4.1 + 2) * 0.6,
}));

/**
 * /surprise 진입 시 짧게 재생되는 오프닝. 거의 검은 화면 -> 별빛이 은은하게 나타남 ->
 * THE FINAL PAGE -> 메인 타이틀 -> 전체가 fade out되며 뒤에 있던 본문(StarField 포함,
 * 이미 마운트돼 있음)이 자연스럽게 드러난다. 완료 시점은 실제 애니메이션 콜백이 아니라
 * 타이머로 고정해서, 마운트 시 initial===animate인 첫 프레임에 onComplete가 잘못
 * 즉시 불리는 일이 없게 한다.
 */
export default function SurpriseOpening({ onComplete }: SurpriseOpeningProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hiding, setHiding] = useState(false);
  // useReducedMotion()은 브라우저의 실제 OS 설정을 클라이언트에서만 읽을 수 있어 서버
  // 렌더 결과와 다를 수 있다. 별을 렌더링할지 여부를 곧바로 그 값으로 분기하면 서버가
  // 만든 HTML과 최초 클라이언트 렌더가 어긋나(hydration mismatch) 버린다. 마운트
  // 이후에만 실제 값을 반영해서, 서버/최초 클라이언트 렌더는 항상 별 없이 동일하게
  // 맞추고 그 다음 렌더부터 조용히 별을 켠다.
  const hasMounted = useHasMounted();
  const showStars = hasMounted && !prefersReducedMotion;

  // 오프닝이 떠 있는 동안은 뒤에 있는 본문을 스크롤할 수 없게 막는다.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    // 각 문구가 나타난 뒤 곧바로 사라지지 않고 충분히 머물도록, 전체 흐름을
    // 0s(어두운 화면+별빛) -> 0.8s(THE FINAL PAGE) -> 2.5s(2026년의 마지막 페이지,
    // 최소 3초 이상 화면에 유지) -> 5.0s(서브 문구) -> 6.6s(오버레이 페이드아웃 시작)
    // 순서로 늘렸다.
    const hideDelay = prefersReducedMotion ? 250 : 6600;
    const totalDuration = prefersReducedMotion ? 700 : 7500;

    const hideTimer = setTimeout(() => setHiding(true), hideDelay);
    const doneTimer = setTimeout(onComplete, totalDuration);

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
      transition={{ duration: prefersReducedMotion ? 0.4 : 0.9, ease: "easeInOut" }}
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-bg"
    >
      {showStars &&
        STARS.map((star, i) => (
          <motion.span
            key={i}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1.1, delay: star.delay, ease: "easeOut" }}
            className="absolute rounded-full bg-star"
            style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size }}
          />
        ))}

      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            prefersReducedMotion ? { duration: 0.3 } : { duration: 0.8, delay: 0.8, ease: "easeOut" }
          }
          className="font-display text-xs tracking-[0.5em] text-star"
        >
          THE FINAL PAGE
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={
            prefersReducedMotion ? { duration: 0.3 } : { duration: 0.9, delay: 2.5, ease: "easeOut" }
          }
          className="font-display text-2xl tracking-wide text-text sm:text-4xl"
        >
          2026년의 마지막 페이지
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            prefersReducedMotion ? { duration: 0.3 } : { duration: 0.8, delay: 5.0, ease: "easeOut" }
          }
          className="font-serif-kr text-sm text-text-soft sm:text-base"
        >
          우리의 2026년은
          <br />
          여기까지 기록되었습니다.
        </motion.p>
      </div>
    </motion.div>
  );
}
