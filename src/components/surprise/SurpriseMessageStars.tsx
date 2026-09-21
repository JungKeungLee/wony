"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { fetchApprovedLetters } from "@/lib/letters";
import type { Letter } from "@/lib/types";

const MAX_STARS = 15;

/** StarField/SurpriseOpening과 동일한 골든 앵글 의사난수 - 서버/클라이언트 렌더가 항상 같다. */
function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

interface MessageStar {
  letter: Letter;
  left: number;
  top: number;
  size: number;
  baseOpacity: number;
  delay: number;
  duration: number;
}

function layoutStars(letters: Letter[]): MessageStar[] {
  return letters.map((letter, i) => ({
    letter,
    // 별들이 서로 너무 붙지 않도록 대략적인 격자 위에 인덱스를 흩뿌린 뒤 약간만 흔든다.
    left: 10 + ((i * 7) % 5) * 18 + pseudoRandom(i * 3.1 + 1) * 10,
    top: 12 + Math.floor(i / 5) * 30 + pseudoRandom(i * 4.7 + 2) * 14,
    size: 5 + pseudoRandom(i * 5.3 + 3) * 5,
    baseOpacity: 0.55 + pseudoRandom(i * 6.1 + 4) * 0.3,
    delay: pseudoRandom(i * 7.9 + 5) * 3,
    duration: 3.5 + pseudoRandom(i * 8.8 + 6) * 3,
  }));
}

/**
 * "2027 메시지 별빛" - 승인된 편지 중 message_2027이 채워진 것만 최신순으로 최대
 * MAX_STARS개 가져와 밤하늘의 작은 별빛으로 흩뿌려 보여준다. 새 편지 테이블은 만들지
 * 않고 기존 letters 데이터를 그대로 재활용한다. 별을 누르면 그 메시지 하나만 카드로
 * 보여주고, 목록처럼 보이지 않도록 항상 한 번에 하나만 연다.
 */
export default function SurpriseMessageStars() {
  const prefersReducedMotion = useReducedMotion();
  const [stars, setStars] = useState<MessageStar[] | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchApprovedLetters()
      .then((letters) => {
        if (cancelled) return;
        const withMessage = letters.filter((l) => l.message_2027 && l.message_2027.trim());
        setStars(layoutStars(withMessage.slice(0, MAX_STARS)));
      })
      .catch(() => {
        // 조회 실패 시 조용히 숨긴다 - SURPRISE 엔딩의 다른 부분에는 영향 없음.
        if (!cancelled) setStars([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!stars || stars.length === 0) return null;

  const active = activeIndex !== null ? stars[activeIndex] : null;

  return (
    <section className="flex min-h-svh flex-col items-center justify-center gap-10 px-6 py-24 text-center">
      <div className="flex flex-col items-center gap-3">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="font-display text-xl tracking-wide text-text sm:text-2xl"
        >
          달빛 아래 모인 소원들 ✦
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="font-serif-kr max-w-sm text-sm leading-relaxed text-text-soft"
        >
          누군가의 작은 소원들이
          <br />
          오늘 밤 달빛 아래 하나둘 모이고 있어요.
        </motion.p>
      </div>

      <div className="relative h-72 w-full max-w-xl sm:h-80">
        {stars.map((star, i) => (
          <button
            key={star.letter.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label="2027년에 남긴 메시지"
            className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ left: `${star.left}%`, top: `${star.top}%` }}
          >
            <motion.span
              aria-hidden
              className="rounded-full bg-star drop-shadow-[0_0_4px_rgba(255,230,167,0.55)]"
              style={{ width: star.size, height: star.size }}
              animate={
                prefersReducedMotion
                  ? undefined
                  : { opacity: [star.baseOpacity, star.baseOpacity + 0.3, star.baseOpacity], scale: [1, 1.15, 1] }
              }
              transition={{
                opacity: { duration: star.duration, delay: star.delay, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: star.duration, delay: star.delay, repeat: Infinity, ease: "easeInOut" },
              }}
              whileHover={{ opacity: 1, scale: 1.4, transition: { duration: 0.25 } }}
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setActiveIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-sm flex-col items-center gap-4 border border-star/25 bg-bg-soft px-8 py-10 text-center"
            >
              <span aria-hidden className="text-lg text-star">
                ✦
              </span>
              <p className="font-serif-kr whitespace-pre-wrap text-base leading-relaxed text-text sm:text-lg">
                {active.letter.message_2027}
              </p>
              <p className="text-[11px] tracking-[0.1em] text-text-soft/70">
                — 어느 워냥이의 메시지
              </p>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="mt-2 border border-white/15 px-6 py-2 text-xs tracking-[0.15em] text-text-soft transition-colors hover:border-star hover:text-star"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
