"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

type Stage = "category" | "announcing" | "revealed";

/** viewport에 들어온 뒤 "AND THE WINNER IS..."가 나타나기까지의 지연(ms). */
const ANNOUNCE_DELAY_MS = 900;
/** viewport에 들어온 뒤 실제 수상작이 드러나기까지의 지연(ms). */
const REVEAL_DELAY_MS = 1900;

interface AwardCategoryRevealProps {
  /** 예: "BEST CONTENT OF THE YEAR" */
  category: string;
  title: string;
  description: string;
}

/**
 * BEST CONTENT/GAME/COLLAB/LEGENDARY MOMENT가 공통으로 쓰는 "발표식" 연출.
 * 카테고리 이름이 viewport에 들어오면: 카테고리 -> "AND THE WINNER IS..." ->
 * 짧은 pause -> 수상작(제목+설명)이 봉투가 살짝 열리듯 opacity+scale+rotateX로
 * 가볍게 드러난다. 클릭 등 사용자 조작 없이 스크롤만으로 자동 진행된다.
 */
export default function AwardCategoryReveal({
  category,
  title,
  description,
}: AwardCategoryRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [stage, setStage] = useState<Stage>(prefersReducedMotion ? "revealed" : "category");

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;
    const announceTimer = window.setTimeout(() => setStage("announcing"), ANNOUNCE_DELAY_MS);
    const revealTimer = window.setTimeout(() => setStage("revealed"), REVEAL_DELAY_MS);
    return () => {
      window.clearTimeout(announceTimer);
      window.clearTimeout(revealTimer);
    };
  }, [isInView, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-16 text-center sm:py-20"
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: prefersReducedMotion ? 0.3 : 0.7, ease: "easeOut" }}
        className="font-display text-xs tracking-[0.4em] text-star sm:text-sm"
      >
        {category}
      </motion.span>

      {(stage === "announcing" || stage === "revealed") && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === "revealed" ? 0.55 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="font-serif-kr text-sm italic text-text-soft sm:text-base"
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
          className="flex w-full flex-col items-center gap-3 border border-star/25 bg-bg-soft/50 px-8 py-10 shadow-[0_0_24px_rgba(255,230,167,0.08)]"
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
