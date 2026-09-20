"use client";

import { motion, useReducedMotion } from "framer-motion";
import { credits } from "@/data/credits";

const LEAD_DELAY = 0;
const LEAD_NAME_DELAY = 0.9;
const THANKS_LABEL_DELAY = 2.1;
const THANKS_NAME_START_DELAY = 3.0;
const THANKS_NAME_STEP = 0.35;
/** 개별 닉네임보다 조금 더 여유를 두고 등장시키기 위한 추가 간격. */
const CLOSING_EXTRA_GAP = 1.3;

export default function SurpriseCredits() {
  const prefersReducedMotion = useReducedMotion();

  const lastNameDelay = THANKS_NAME_START_DELAY + (credits.specialThanks.length - 1) * THANKS_NAME_STEP;
  const closingDelay = lastNameDelay + CLOSING_EXTRA_GAP;

  const t = (delay: number, duration = 0.9) =>
    prefersReducedMotion
      ? { delay: 0, duration: 0.4, ease: "easeOut" as const }
      : { delay, duration, ease: "easeOut" as const };

  return (
    <section className="flex min-h-svh flex-col items-center justify-center gap-16 px-6 py-24 text-center">
      <div className="flex flex-col items-center gap-4">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={t(LEAD_DELAY)}
          className="font-display text-xs tracking-[0.4em] text-star"
        >
          PROJECT LEAD
        </motion.span>

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={t(LEAD_NAME_DELAY)}
          className="font-serif-kr text-lg text-text sm:text-xl"
        >
          {credits.projectLead}
        </motion.span>
      </div>

      <div className="flex flex-col items-center gap-6">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={t(THANKS_LABEL_DELAY)}
          className="font-display text-xs tracking-[0.3em] text-text-soft"
        >
          SPECIAL THANKS TO
        </motion.span>

        <ul className="flex max-w-md flex-col items-center gap-3">
          {credits.specialThanks.map((name, i) => (
            <motion.li
              key={name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5% 0px" }}
              transition={t(THANKS_NAME_START_DELAY + i * THANKS_NAME_STEP, 0.7)}
              className="font-serif-kr text-base text-text sm:text-lg"
            >
              {name}
            </motion.li>
          ))}
        </ul>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={t(closingDelay, 1.1)}
        className="font-serif-kr max-w-sm text-sm italic leading-relaxed text-pink/90 sm:text-base"
      >
        그리고 함께해주신 모든 워냥이들 ✦
      </motion.p>
    </section>
  );
}
