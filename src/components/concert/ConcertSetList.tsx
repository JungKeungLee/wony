"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import { CONCERT_SET_LIST, CONCERT_SET_LIST_TAGLINE } from "@/data/concert";

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

export default function ConcertSetList() {
  return (
    <section className="relative overflow-hidden bg-cream px-6 py-20 sm:py-28">
      {/* 은은한 파스텔 광원 장식 - 다크 바이닐 대신 가벼운 빛 번짐만 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-lavender/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-peach/40 blur-3xl"
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="relative mx-auto flex max-w-4xl flex-col gap-10"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.h2
            variants={cardVariant}
            className="font-display text-sm tracking-[0.4em] text-gold-deep"
          >
            ♫ SET LIST TEASER
          </motion.h2>
          <motion.p
            variants={cardVariant}
            className="font-serif-kr text-sm italic leading-relaxed text-ink-soft"
          >
            {CONCERT_SET_LIST_TAGLINE.map((line, i) => (
              <span key={i}>
                {line}
                {i < CONCERT_SET_LIST_TAGLINE.length - 1 && <br />}
              </span>
            ))}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CONCERT_SET_LIST.map((song) => (
            <motion.div
              key={song.number}
              variants={cardVariant}
              className="flex flex-col items-center gap-3 border border-white/80 bg-white/70 px-6 py-10 text-center shadow-[0_10px_30px_rgba(201,163,92,0.12)] backdrop-blur-sm"
            >
              <span className="font-display text-[11px] tracking-[0.3em] text-champagne">
                SONG {song.number}
              </span>
              <span className="font-serif-kr text-2xl tracking-[0.1em] text-ink">
                {song.revealed ? song.title : "??????"}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
