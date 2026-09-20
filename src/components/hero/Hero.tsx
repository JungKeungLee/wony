"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { HERO_BACKGROUND_IMAGE, HERO_IMAGE_FOCAL_POINT } from "@/lib/constants";
import HiddenStar from "@/components/effects/HiddenStar";

/**
 * 사이트 최초 진입 시 재생되는 시네마틱 오프닝의 등장 타이밍(초).
 * 전체 시퀀스가 약 1.5~2.2초 안에 끝나도록 delay/duration을 짧게 유지한다.
 */
const TIMING = {
  background: { delay: 0, duration: 0.7 },
  title: { delay: 0.15, duration: 0.55 },
  subtitle: { delay: 0.5, duration: 0.5 },
  tagline: { delay: 0.8, duration: 0.5 },
  chrome: { delay: 1.3, duration: 0.6 },
};

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const t = (timing: { delay: number; duration: number }) =>
    prefersReducedMotion ? { delay: 0, duration: 0.3 } : timing;

  return (
    <section className="relative isolate flex h-svh flex-col items-center justify-center overflow-hidden bg-bg px-6 text-center">
      <HiddenStar
        id="home"
        variant="home-hero-stars"
        className="absolute right-5 top-20 sm:right-8 sm:top-24"
      />
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0.4, scale: 1.04, filter: "blur(3px) brightness(0.85)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px) brightness(1)" }}
        transition={{ ...t(TIMING.background), ease: "easeOut" }}
      >
        {HERO_BACKGROUND_IMAGE ? (
          <Image
            src={HERO_BACKGROUND_IMAGE}
            alt=""
            fill
            priority
            style={{ objectPosition: HERO_IMAGE_FOCAL_POINT }}
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,217,226,0.08),transparent_55%),linear-gradient(180deg,#080b16_0%,#111627_60%,#080b16_100%)]" />
        )}
      </motion.div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-bg/35 via-bg/8 to-bg/40" />

      <div className="relative flex flex-col items-center gap-5">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...t(TIMING.title), ease: "easeOut" }}
          className="font-display text-6xl tracking-[0.1em] text-text sm:text-8xl md:text-9xl"
        >
          WONY
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...t(TIMING.subtitle), ease: "easeOut" }}
          className="relative font-display text-xs tracking-[0.4em] text-text-soft sm:text-sm"
        >
          OUR MEMORIES OF 2026
          <HiddenStar
            id="home"
            variant="home-subtitle"
            className="absolute -right-7 top-1/2 -translate-y-1/2 sm:-right-9"
          />
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...t(TIMING.tagline), ease: "easeOut" }}
          className="font-serif-kr mt-4 text-lg text-text sm:text-xl"
        >
          올해도 함께해줘서 고마워
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={t(TIMING.chrome)}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-text-soft"
      >
        <HiddenStar
          id="home"
          variant="home-scroll"
          className="absolute -right-9 top-1/2 -translate-y-1/2"
        />
        <span className="text-[10px] tracking-[0.3em]">SCROLL</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
          className="text-lg"
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  );
}
