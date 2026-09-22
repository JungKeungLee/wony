"use client";

import { motion, useReducedMotion } from "framer-motion";
import { credits } from "@/data/credits";

/** PROJECT LEAD → SPECIAL THANKS → 마지막 문구까지 순서대로 살짝만 늦춰서 나타난다.
 * "영화 엔딩 크레딧이 한참 걸려 흘러가는" 느낌이 아니라 한 덩어리의 엔딩 메시지가
 * 짧게 이어서 드러나는 정도로 - 값을 전부 1초 안팎으로 좁혔다. */
const LEAD_DELAY = 0;
const LEAD_NAME_DELAY = 0.12;
const THANKS_LABEL_DELAY = 0.28;
const THANKS_NAME_START_DELAY = 0.38;
const THANKS_NAME_STEP = 0.06;
const CLOSING_EXTRA_DELAY = 0.25;

export default function SurpriseCredits() {
  const prefersReducedMotion = useReducedMotion();

  const lastNameDelay = THANKS_NAME_START_DELAY + (credits.specialThanks.length - 1) * THANKS_NAME_STEP;
  const closingDelay = lastNameDelay + CLOSING_EXTRA_DELAY;

  const t = (delay: number, duration = 0.7) =>
    prefersReducedMotion
      ? { delay: 0, duration: 0.4, ease: "easeOut" as const }
      : { delay, duration, ease: "easeOut" as const };

  return (
    <section className="flex flex-col items-center gap-10 px-6 pb-24 pt-6 text-center sm:gap-12 sm:pb-32 sm:pt-10">
      {/* OUR MEMORIES OF 2026와 Credits를 가르는 아주 옅은 divider. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={t(LEAD_DELAY, 0.8)}
        className="flex items-center gap-3 text-star/50"
      >
        <span className="h-px w-10 bg-current sm:w-14" />
        <span className="text-xs">✦</span>
        <span className="h-px w-10 bg-current sm:w-14" />
      </motion.div>

      <div className="flex flex-col items-center gap-2">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={t(LEAD_DELAY)}
          className="font-display text-[11px] tracking-[0.4em] text-text-soft/70"
        >
          PROJECT LEAD
        </motion.span>

        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={t(LEAD_NAME_DELAY)}
          className="font-serif-kr text-xl text-star drop-shadow-[0_0_12px_rgba(255,230,167,0.35)] sm:text-2xl"
        >
          {credits.projectLead}
        </motion.span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={t(THANKS_LABEL_DELAY)}
          className="font-display text-[11px] tracking-[0.3em] text-text-soft/70"
        >
          SPECIAL THANKS TO
        </motion.span>

        <ul className="grid list-none grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
          {credits.specialThanks.map((name, i) => (
            <motion.li
              key={name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5% 0px" }}
              transition={t(THANKS_NAME_START_DELAY + i * THANKS_NAME_STEP, 0.6)}
              className="font-serif-kr text-base text-text sm:text-lg"
            >
              {name}
            </motion.li>
          ))}
        </ul>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={t(closingDelay, 0.9)}
        className="font-serif-kr max-w-xs text-base leading-relaxed text-star sm:text-lg"
      >
        그리고 함께해주신
        <br />
        모든 워냥이들 ✦
      </motion.p>
    </section>
  );
}
