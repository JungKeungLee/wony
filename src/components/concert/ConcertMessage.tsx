"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { CONCERT_DATE_SHORT, CONCERT_MESSAGE_CLOSING, CONCERT_MESSAGE_LINES } from "@/data/concert";

export default function ConcertMessage() {
  return (
    <section className="relative overflow-hidden bg-lavender px-6 py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_15%,rgba(255,222,192,0.5),transparent_55%)]"
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="relative mx-auto max-w-xl"
      >
        {/* 엽서 느낌의 카드 - 상단 washi tape + 우측 상단 우표 장식 */}
        <div className="relative border border-white bg-cream px-8 py-10 shadow-[0_18px_40px_rgba(69,50,63,0.12)] sm:px-12 sm:py-12">
          <span
            aria-hidden
            className="absolute -top-3 left-10 h-6 w-20 -rotate-6 bg-peach/70"
          />
          <span
            aria-hidden
            className="absolute right-6 top-6 flex h-12 w-9 rotate-3 items-center justify-center border border-champagne/60 bg-white/70 text-sm text-champagne"
          >
            ♪
          </span>

          <span className="font-display text-xs tracking-[0.4em] text-gold-deep">MESSAGE</span>

          <p className="font-serif-kr mt-6 text-base leading-loose text-ink sm:text-lg">
            {CONCERT_MESSAGE_LINES.map((line, i) =>
              line === "" ? <br key={i} /> : (
                <span key={i}>
                  {line}
                  <br />
                </span>
              )
            )}
          </p>

          <div className="mt-8 flex flex-col items-end gap-1 border-t border-champagne/30 pt-5 text-right">
            <span className="font-display text-sm tracking-[0.15em] text-champagne">
              {CONCERT_DATE_SHORT}
            </span>
            <p className="font-serif-kr text-base italic text-ink">
              {CONCERT_MESSAGE_CLOSING.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < CONCERT_MESSAGE_CLOSING.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
