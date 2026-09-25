"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import { CONCERT_GALLERY_ITEMS, type ConcertGalleryCategory } from "@/data/concert";
import { CATEGORY_ICON, CATEGORY_TABS } from "./ConcertGallery.constants";
import ConcertGalleryModal from "./ConcertGalleryModal";

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

/** 폴라로이드처럼 살짝씩 번갈아 기울여 캐주얼한 느낌을 준다. */
const TILT = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

export default function ConcertGallery() {
  const [activeCategory, setActiveCategory] = useState<ConcertGalleryCategory | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      activeCategory === null
        ? CONCERT_GALLERY_ITEMS
        : CONCERT_GALLERY_ITEMS.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  function selectCategory(category: ConcertGalleryCategory | null) {
    setActiveCategory(category);
    setActiveIndex(null);
  }

  return (
    <section className="relative bg-lavender px-6 py-20 sm:py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="mx-auto flex max-w-5xl flex-col gap-10"
      >
        <motion.h2
          variants={cardVariant}
          className="font-display text-center text-sm tracking-[0.4em] text-gold-deep"
        >
          GALLERY / TEASER
        </motion.h2>

        <motion.div
          variants={cardVariant}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => selectCategory(tab.value)}
              className={`min-h-9 px-4 py-1.5 text-xs tracking-[0.15em] transition-colors ${
                activeCategory === tab.value
                  ? "border border-champagne bg-white/70 text-gold-deep"
                  : "border border-white/70 bg-white/40 text-ink-soft hover:border-champagne/60 hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
          {filtered.map((item, i) => (
            <motion.button
              key={item.id}
              type="button"
              variants={cardVariant}
              onClick={() => setActiveIndex(i)}
              className={`group flex flex-col border border-white bg-white p-2 pb-4 text-left shadow-[0_12px_28px_rgba(69,50,63,0.12)] transition-transform hover:-translate-y-1 hover:rotate-0 ${TILT[i % TILT.length]}`}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[linear-gradient(160deg,#fdf1e4_0%,#ece2fb_55%,#ffdec0_100%)]">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center text-3xl text-champagne/70 transition-transform duration-500 group-hover:scale-110"
                  >
                    {CATEGORY_ICON[item.category]}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-0.5 px-1 pt-3">
                <span className="font-display text-xs tracking-[0.15em] text-ink">
                  {item.label}
                </span>
                {item.caption && (
                  <span className="text-[10px] text-ink-soft">{item.caption}</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <ConcertGalleryModal
        items={filtered}
        index={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={(i) => setActiveIndex(i)}
      />
    </section>
  );
}
