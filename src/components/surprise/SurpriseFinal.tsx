"use client";

import { useEffect, type RefObject } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useMusic } from "@/context/MusicContext";

/** 엔딩 구간에서만 살짝 낮추는 정도. 사용자의 저장된 volume 값 자체는 건드리지 않는다. */
const DUCK_FACTOR = 0.6;

interface SurpriseFinalProps {
  /** 부모(SurpriseExperience)가 BGM 덕킹(isInView) 판단에 쓰는 섹션 전체 ref. */
  sectionRef: RefObject<HTMLElement | null>;
  /** "See you in 2027 ✦" 제목 자체의 ref. 부모가 이 제목이 viewport 세로 중심에
   * 도달했는지(자동 스크롤 정지 + 엔딩 영상 트리거 조건)를 판단하는 데 쓴다. */
  titleRef: RefObject<HTMLHeadingElement | null>;
}

export default function SurpriseFinal({ sectionRef, titleRef }: SurpriseFinalProps) {
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "-20% 0px" });
  const { duckVolume, restoreVolume } = useMusic();

  useEffect(() => {
    if (isInView) {
      duckVolume(DUCK_FACTOR);
    } else {
      restoreVolume();
    }
  }, [isInView, duckVolume, restoreVolume]);

  // 페이지를 벗어날 때(HOME으로 이동 등)는 반드시 원래 볼륨으로 되돌린다.
  useEffect(() => {
    return () => restoreVolume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <motion.h2
        ref={titleRef}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={prefersReducedMotion ? { duration: 0.4 } : { duration: 1.3, ease: "easeOut" }}
        className="font-display text-3xl tracking-wide text-text sm:text-5xl"
      >
        See you in 2027 ✦
      </motion.h2>

      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={
          prefersReducedMotion
            ? { duration: 0.4, delay: 0.1 }
            : { duration: 1, ease: "easeOut", delay: 0.6 }
        }
        className="font-display text-xs tracking-[0.3em] text-text-soft"
      >
        OUR MEMORIES OF 2026
      </motion.span>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={
          prefersReducedMotion
            ? { duration: 0.4, delay: 0.15 }
            : { duration: 1, ease: "easeOut", delay: 1.0 }
        }
        className="font-serif-kr text-sm text-text-soft sm:text-base"
      >
        Thank you for being part of our 2026.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={
          prefersReducedMotion
            ? { duration: 0.4, delay: 0.3 }
            : { duration: 1, ease: "easeOut", delay: 1.6 }
        }
      >
        <Link
          href="/"
          className="mt-4 inline-block border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-star hover:text-star"
        >
          [ HOME으로 돌아가기 ]
        </Link>
      </motion.div>
    </section>
  );
}
