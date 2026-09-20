"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Letter } from "@/lib/types";

interface LetterModalProps {
  letter: Letter | null;
  onClose: () => void;
}

export default function LetterModal({ letter, onClose }: LetterModalProps) {
  const isOpen = letter !== null;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const from = letter?.is_anonymous ? "익명의 팬" : letter?.nickname;

  return (
    <AnimatePresence>
      {letter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto border border-white/10 bg-bg-soft px-7 py-10 sm:px-10"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center text-xl text-text-soft transition-colors hover:text-pink"
            >
              ✕
            </button>

            <p className="font-display text-sm tracking-[0.2em] text-star">
              Dear. WONY
            </p>

            <p className="font-serif-kr mt-6 whitespace-pre-wrap text-base leading-relaxed text-text sm:text-lg">
              {letter.content}
            </p>

            <p className="font-serif-kr mt-6 whitespace-pre-wrap text-base italic leading-relaxed text-pink/90">
              {letter.message_2027}
            </p>

            <p className="font-serif-kr mt-8 text-right text-sm text-text-soft">
              From. {from}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
