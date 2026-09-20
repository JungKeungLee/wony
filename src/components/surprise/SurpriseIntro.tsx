"use client";

import { motion, useReducedMotion } from "framer-motion";

interface SurpriseIntroProps {
  /** SurpriseOpening이 끝난 뒤 true가 된다. THE FINAL PAGE/메인 타이틀은 오프닝 쪽에서
   * 이미 보여줬으므로, 여기서는 그 뒤를 잇는 서브 문구만 이 시점에 맞춰 fade-in한다. */
  ready: boolean;
}

export default function SurpriseIntro({ ready }: SurpriseIntroProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={prefersReducedMotion ? { duration: 0.4 } : { duration: 1.2, ease: "easeOut" }}
        className="font-serif-kr max-w-sm text-sm leading-relaxed text-text-soft sm:text-base"
      >
        우리의 2026년은
        <br />
        여기까지 기록되었습니다.
      </motion.p>
    </section>
  );
}
