"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function SurpriseMemories() {
  const prefersReducedMotion = useReducedMotion();
  const t = (delay: number) =>
    prefersReducedMotion ? { duration: 0.4, delay: 0 } : { duration: 1.2, ease: "easeOut" as const, delay };

  return (
    <section className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={t(0)}
        className="font-serif-kr max-w-sm whitespace-pre-line text-base leading-loose text-text sm:max-w-md sm:text-lg"
      >
        {"2026년의 수많은 장면들이\n\n언젠가 다시 웃을 수 있는\n따뜻한 기억이 되기를."}
      </motion.p>

      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={t(prefersReducedMotion ? 0.1 : 0.8)}
        className="font-display text-xs tracking-[0.3em] text-text-soft"
      >
        OUR MEMORIES OF 2026
      </motion.span>
    </section>
  );
}
