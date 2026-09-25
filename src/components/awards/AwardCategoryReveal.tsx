"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

type Stage = "next-award" | "category" | "announcing" | "revealed";

/** "NEXT AWARD" 예고가 보이는 시간(ms) - showNextAwardIntro일 때만 쓰인다. */
const NEXT_AWARD_MS = 700;
/** viewport(또는 NEXT AWARD 예고)에 들어온 뒤 "AND THE WINNER IS..."가
 * 나타나기까지의 기본 지연(ms) - mood별 pauseMultiplier로 조금씩 다르게 늘어난다. */
const BASE_ANNOUNCE_DELAY_MS = 900;
/** 기본 REVEAL 지연(ms). */
const BASE_REVEAL_DELAY_MS = 1900;

export type AwardMood = "elegant" | "playful" | "warm" | "emotional";

/** Award마다 완전히 같은 카드가 반복되는 느낌이 들지 않도록, 톤/색/속도를 아주
 * 살짝만 다르게 준다 - 전체 디자인 언어(다크 네이비 + gold/pink 포인트)는 그대로. */
const MOOD_STYLES: Record<
  AwardMood,
  { announceClass: string; cardBorder: string; cardGlow: string; pauseMultiplier: number }
> = {
  elegant: {
    announceClass: "text-text-soft",
    cardBorder: "border-star/25",
    cardGlow: "shadow-[0_0_24px_rgba(255,230,167,0.08)]",
    pauseMultiplier: 1,
  },
  playful: {
    announceClass: "text-pink/90",
    cardBorder: "border-pink/30",
    cardGlow: "shadow-[0_0_24px_rgba(255,182,204,0.12)]",
    pauseMultiplier: 0.85,
  },
  warm: {
    announceClass: "text-star/90",
    cardBorder: "border-star/45",
    cardGlow: "shadow-[0_0_26px_rgba(255,209,140,0.16)]",
    pauseMultiplier: 1,
  },
  emotional: {
    announceClass: "text-pink/80",
    cardBorder: "border-pink/25",
    cardGlow: "shadow-[0_0_26px_rgba(255,182,204,0.1)]",
    pauseMultiplier: 1.25,
  },
};

interface AwardCategoryRevealProps {
  /** 예: "BEST CONTENT OF THE YEAR" */
  category: string;
  title: string;
  description: string;
  /** BEST VIDEO 다음, 맨 처음 이어지는 Award(BEST CONTENT)에서만 true로 준다 -
   * 카테고리 이름 전에 "NEXT AWARD" 예고를 짧게 보여준다. 나머지 Award는
   * 기존처럼 카테고리 이름부터 바로 시작한다. */
  showNextAwardIntro?: boolean;
  /** Award별 분위기 차이(색/속도) - 기본값은 elegant. */
  mood?: AwardMood;
}

/**
 * BEST CONTENT/GAME/COLLAB/LEGENDARY MOMENT가 공통으로 쓰는 "발표식" 연출.
 * (NEXT AWARD ->) 카테고리 -> "AND THE WINNER IS..." -> 짧은 pause -> 수상작
 * (제목+설명)이 봉투가 살짝 열리듯 opacity+scale+rotateX로 가볍게 드러난다.
 * 클릭 등 사용자 조작 없이 스크롤만으로 자동 진행되고, BEST VIDEO와 달리
 * 3-2-1 카운트다운은 쓰지 않는다(카운트다운은 BEST VIDEO 1위 발표 전용).
 *
 * useInView({ once: true })라 viewport에 한 번 들어와 애니메이션이 시작되면,
 * 이후 위아래로 다시 스크롤해도 처음부터 재실행되지 않는다. 스크롤을 잠그거나
 * 강제로 넘기지 않는다 - 사용자가 이 구간을 볼 때 자연스럽게 시작될 뿐이다.
 */
export default function AwardCategoryReveal({
  category,
  title,
  description,
  showNextAwardIntro = false,
  mood = "elegant",
}: AwardCategoryRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const initialStage: Stage = prefersReducedMotion
    ? "revealed"
    : showNextAwardIntro
      ? "next-award"
      : "category";
  const [stage, setStage] = useState<Stage>(initialStage);
  const hasStartedRef = useRef(false);
  const moodStyle = MOOD_STYLES[mood];

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const announceDelay = Math.round(BASE_ANNOUNCE_DELAY_MS * moodStyle.pauseMultiplier);
    const revealDelay = Math.round(BASE_REVEAL_DELAY_MS * moodStyle.pauseMultiplier);
    const timers: number[] = [];

    if (showNextAwardIntro) {
      timers.push(window.setTimeout(() => setStage("category"), NEXT_AWARD_MS));
      timers.push(window.setTimeout(() => setStage("announcing"), NEXT_AWARD_MS + announceDelay));
      timers.push(window.setTimeout(() => setStage("revealed"), NEXT_AWARD_MS + revealDelay));
    } else {
      timers.push(window.setTimeout(() => setStage("announcing"), announceDelay));
      timers.push(window.setTimeout(() => setStage("revealed"), revealDelay));
    }

    return () => timers.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-16 text-center sm:py-20"
    >
      {stage === "next-award" && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="font-serif-kr text-xs italic text-text-soft/70"
        >
          NEXT AWARD
        </motion.span>
      )}

      {stage !== "next-award" && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.3 : 0.7, ease: "easeOut" }}
          className="font-display text-xs tracking-[0.4em] text-star sm:text-sm"
        >
          {category}
        </motion.span>
      )}

      {(stage === "announcing" || stage === "revealed") && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === "revealed" ? 0.55 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`font-serif-kr text-sm italic sm:text-base ${moodStyle.announceClass}`}
        >
          AND THE WINNER IS...
        </motion.p>
      )}

      {stage === "revealed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotateX: -14 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ transformPerspective: 700 }}
          className={`flex w-full flex-col items-center gap-3 border bg-bg-soft/50 px-8 py-10 ${moodStyle.cardBorder} ${moodStyle.cardGlow}`}
        >
          <span className="font-serif-kr whitespace-pre-line text-xl text-text sm:text-2xl">
            [ {title} ]
          </span>
          <p className="font-serif-kr whitespace-pre-line text-sm leading-relaxed text-text-soft sm:text-base">
            {description}
          </p>
        </motion.div>
      )}
    </section>
  );
}
