"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getFanArtImageUrl } from "@/lib/fanArt";
import type { FanArt } from "@/lib/types";

interface FanArtModalProps {
  arts: FanArt[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function ModalArtImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-[40vh] w-[80vw] max-w-md flex-col items-center justify-center gap-3 bg-bg-soft text-star/50">
        <span className="text-2xl">✦</span>
        <span className="text-xs tracking-[0.2em] text-text-soft/50">
          이미지를 불러올 수 없습니다
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- 원본 비율 그대로 보여주는 라이트박스라 next/image의 고정 크기 요구사항과 맞지 않음
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="max-h-[60vh] max-w-full object-contain"
    />
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function FanArtModal({ arts, index, onClose, onNavigate }: FanArtModalProps) {
  const art = index !== null ? arts[index] : null;

  useEffect(() => {
    if (art === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (index === null) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((index - 1 + arts.length) % arts.length);
      if (e.key === "ArrowRight") onNavigate((index + 1) % arts.length);
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [art, index, arts.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {art && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-2xl text-text/80 transition-colors hover:text-pink sm:right-6 sm:top-6"
          >
            ✕
          </button>

          {arts.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate((index - 1 + arts.length) % arts.length);
                }}
                aria-label="이전 작품"
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-3xl text-text/70 transition-colors hover:text-pink sm:left-6"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate((index + 1) % arts.length);
                }}
                aria-label="다음 작품"
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-3xl text-text/70 transition-colors hover:text-pink sm:right-6"
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
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto border border-white/10 bg-bg-soft"
          >
            <div className="flex items-center justify-center bg-black/30 p-4">
              <ModalArtImage
                key={art.image_path}
                src={getFanArtImageUrl(art.image_path)}
                alt={art.title}
              />
            </div>

            <div className="flex flex-col gap-2 px-6 py-6 sm:px-8">
              <h3 className="font-serif-kr text-lg text-text sm:text-xl">{art.title}</h3>
              <p className="text-xs tracking-[0.15em] text-star">
                Artist / From. {art.nickname}
              </p>
              {art.message && (
                <p className="font-serif-kr mt-3 whitespace-pre-wrap text-sm italic leading-relaxed text-pink/90 sm:text-base">
                  {art.message}
                </p>
              )}
              <p className="mt-4 text-xs text-text-soft/60">{formatDate(art.created_at)}</p>
            </div>
          </motion.div>

          {arts.length > 1 && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-text-soft">
              {index + 1} / {arts.length}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
