"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ConcertGalleryItem } from "@/data/concert";
import { CATEGORY_ICON } from "./ConcertGallery.constants";

interface ConcertGalleryModalProps {
  items: ConcertGalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ConcertGalleryModal({
  items,
  index,
  onClose,
  onNavigate,
}: ConcertGalleryModalProps) {
  const item = index !== null ? items[index] : null;

  useEffect(() => {
    if (item === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (index === null) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((index - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") onNavigate((index + 1) % items.length);
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, index, items.length]);

  return (
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-2xl text-cream transition-colors hover:text-pale-yellow sm:right-6 sm:top-6"
          >
            ✕
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate((index - 1 + items.length) % items.length);
                }}
                aria-label="이전 이미지"
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-3xl text-cream/80 transition-colors hover:text-pale-yellow sm:left-6"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate((index + 1) % items.length);
                }}
                aria-label="다음 이미지"
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-3xl text-cream/80 transition-colors hover:text-pale-yellow sm:right-6"
              >
                ›
              </button>
            </>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-lg flex-col overflow-hidden border border-white bg-cream"
          >
            <div className="relative flex aspect-[4/5] w-full items-center justify-center bg-[linear-gradient(160deg,#fdf1e4_0%,#ece2fb_55%,#ffdec0_100%)]">
              <span aria-hidden className="text-5xl text-champagne">
                {CATEGORY_ICON[item.category]}
              </span>
            </div>
            <div className="flex flex-col gap-1 px-6 py-5 text-center">
              <p className="font-display text-sm tracking-[0.2em] text-gold-deep">{item.label}</p>
              {item.caption && (
                <p className="font-serif-kr text-sm text-ink-soft">{item.caption}</p>
              )}
            </div>
          </motion.div>

          {items.length > 1 && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-cream/80">
              {index + 1} / {items.length}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
