"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { INTRO_LINES } from "@/lib/constants";

interface IntroProps {
  onComplete: () => void;
}

export default function Intro({ onComplete }: IntroProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const lineDuration = prefersReducedMotion ? 1100 : 2200;

  useEffect(() => {
    if (lineIndex >= INTRO_LINES.length) return;
    const timer = setTimeout(() => setLineIndex((prev) => prev + 1), lineDuration);
    return () => clearTimeout(timer);
  }, [lineIndex, lineDuration]);

  const showButton = lineIndex >= INTRO_LINES.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
      className="fixed inset-0 z-30 flex min-h-svh flex-col items-center justify-center gap-12 px-6 text-center"
    >
      <div className="flex h-24 items-center justify-center sm:h-28">
        <AnimatePresence mode="wait">
          {!showButton && (
            <motion.p
              key={lineIndex}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="font-serif-kr max-w-xs text-xl leading-relaxed text-text sm:max-w-lg sm:text-2xl md:text-3xl"
            >
              {INTRO_LINES[lineIndex]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showButton && (
          <motion.button
            type="button"
            onClick={onComplete}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-serif-kr border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink sm:text-base"
          >
            [ 추억을 열어보기 ]
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
