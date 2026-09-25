"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import {
  CONCERT_ARTIST,
  CONCERT_ARTIST_EN,
  CONCERT_DATE_LABEL,
  CONCERT_SUBTITLE_KO,
  CONCERT_TITLE_LINE_1,
  CONCERT_TITLE_LINE_2,
} from "@/data/concert";

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

const CARDS = [
  { label: "DATE", primary: CONCERT_DATE_LABEL, secondary: null },
  { label: "ARTIST", primary: CONCERT_ARTIST, secondary: CONCERT_ARTIST_EN },
  {
    label: "TITLE",
    primary: `${CONCERT_TITLE_LINE_1} ${CONCERT_TITLE_LINE_2}`,
    secondary: CONCERT_SUBTITLE_KO,
  },
];

export default function ConcertInfo() {
  return (
    <section
      id="concert-info"
      className="relative scroll-mt-24 bg-cream px-6 py-20 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(236,226,251,0.6),transparent_55%),radial-gradient(ellipse_at_85%_90%,rgba(255,222,192,0.5),transparent_55%)]"
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="relative mx-auto flex max-w-5xl flex-col items-center gap-12"
      >
        <motion.h2
          variants={cardVariant}
          className="font-display text-sm tracking-[0.4em] text-gold-deep"
        >
          ✦ CONCERT INFO
        </motion.h2>

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
          {CARDS.map((card) => (
            <motion.div
              key={card.label}
              variants={cardVariant}
              className="flex flex-col items-center gap-3 border border-white/80 bg-white/70 px-6 py-10 text-center shadow-[0_10px_30px_rgba(201,163,92,0.15)] backdrop-blur-md"
            >
              <span className="font-display text-[11px] tracking-[0.35em] text-champagne">
                {card.label}
              </span>
              <p className="font-serif-kr text-lg leading-snug text-ink sm:text-xl">
                {card.primary}
              </p>
              {card.secondary && (
                <p className="text-xs tracking-[0.2em] text-ink-soft">{card.secondary}</p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
