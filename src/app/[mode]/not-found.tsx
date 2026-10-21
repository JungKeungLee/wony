"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function NotFound() {
  const prefersReducedMotion = useReducedMotion();
  const t = (delay: number) =>
    prefersReducedMotion ? { delay: 0, duration: 0.3 } : { delay, duration: 0.7, ease: "easeOut" as const };

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-display text-[clamp(7rem,32vw,22rem)] leading-none text-white/5"
      >
        404
      </span>

      <div className="relative flex flex-col items-center gap-5">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0)}
          className="font-display text-xs tracking-[0.4em] text-star"
        >
          LOST IN THE STARS
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.15)}
          className="font-display text-3xl leading-snug tracking-wide text-text sm:text-5xl md:text-6xl"
        >
          별빛 사이에서
          <br />
          페이지를 잃어버렸어요 ✦
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.35)}
          className="font-serif-kr max-w-sm text-sm leading-relaxed text-text-soft sm:text-base"
        >
          찾고 있던 페이지는
          <br />
          조금 멀리 여행을 떠난 것 같아요.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={t(0.55)}>
          <Link
            href="/"
            className="mt-4 inline-block border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-star hover:text-star"
          >
            [ HOME으로 돌아가기 ]
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
