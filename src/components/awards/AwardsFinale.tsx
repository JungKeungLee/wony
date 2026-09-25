"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCinematicTransition } from "@/context/CinematicTransitionContext";

const LETTERS_HREF = "/letters";
/** 정식 사이트의 다른 챕터 전환과 같은 방식(같은 훅)을 재사용하되, 이 페이지에
 * 어울리는 문구만 새로 쓴다 - 새로운 전환 시스템은 만들지 않는다. */
const LETTERS_TRANSITION_PHRASE = "그 마음들을 다시 읽어봅니다.";

/**
 * WONY AWARDS 2026의 마지막 장면. 모든 Award 발표 뒤 새 상을 더 주지 않고,
 * 화면을 차분하게 가라앉히는 문구 -> "THANK YOU FOR OUR 2026 ✦" -> LETTER로
 * 이어지는 문구 -> CTA 순서로 마무리한다.
 */
export default function AwardsFinale() {
  const { navigate } = useCinematicTransition();
  const prefersReducedMotion = useReducedMotion();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    navigate(LETTERS_HREF, LETTERS_TRANSITION_PHRASE);
  }

  const t = (delay: number) =>
    prefersReducedMotion ? { duration: 0.4, delay: 0 } : { duration: 0.9, delay, ease: "easeOut" as const };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={t(0)}
      className="mx-auto flex max-w-md flex-col items-center gap-8 border-t border-white/10 px-6 py-24 text-center sm:py-28"
    >
      <p className="font-serif-kr text-base leading-relaxed text-text-soft sm:text-lg">
        수상한 순간도,
        <br />
        <br />
        그렇지 않은 순간도,
        <br />
        <br />
        모두 우리가 함께 만든
        <br />
        2026년이었습니다.
      </p>

      <p className="font-display text-xl tracking-[0.2em] text-star sm:text-2xl">
        THANK YOU FOR
        <br />
        OUR 2026 ✦
      </p>

      <p className="font-serif-kr text-sm leading-relaxed text-text-soft/80 sm:text-base">
        그리고 숫자와 순위로
        <br />
        남길 수 없는 마음들도 있었습니다.
      </p>

      <Link
        href={LETTERS_HREF}
        onClick={handleClick}
        className="mt-1 inline-block min-h-11 border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-star hover:text-star"
      >
        [ 남겨진 마음 읽어보기 ✦ ]
      </Link>
    </motion.section>
  );
}
