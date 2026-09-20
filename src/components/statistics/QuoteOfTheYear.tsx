"use client";

import { motion } from "framer-motion";
import type { QuoteOfTheYearData } from "@/lib/types";

export default function QuoteOfTheYear({ quote, date, description }: QuoteOfTheYearData) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="mx-auto flex max-w-2xl flex-col items-center gap-5 border-y border-white/10 px-6 py-16 text-center sm:py-20"
    >
      <span className="font-display text-xs tracking-[0.4em] text-star">
        QUOTE OF THE YEAR
      </span>
      <blockquote className="font-serif-kr text-2xl leading-relaxed text-text sm:text-4xl">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <p className="text-xs tracking-[0.15em] text-text-soft">{date}</p>
      <p className="text-sm text-text-soft sm:text-base">{description}</p>
    </motion.section>
  );
}
