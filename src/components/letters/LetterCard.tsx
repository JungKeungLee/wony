"use client";

import { motion } from "framer-motion";
import type { Letter } from "@/lib/types";

interface LetterCardProps {
  letter: Letter;
  delay?: number;
  onOpen: () => void;
}

export default function LetterCard({ letter, delay = 0, onOpen }: LetterCardProps) {
  const from = letter.is_anonymous ? "익명의 팬" : letter.nickname;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className="group flex flex-col items-center gap-4 border border-white/10 bg-bg-soft/50 px-6 py-10 text-center transition-colors hover:border-pink/50 hover:bg-bg-soft"
    >
      <span
        aria-hidden
        className="text-4xl transition-transform duration-300 group-hover:-translate-y-1"
      >
        💌
      </span>
      <span className="font-serif-kr text-sm text-text-soft sm:text-base">
        From. {from}
      </span>
    </motion.button>
  );
}
