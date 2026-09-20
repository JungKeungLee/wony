"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface ImageModalState {
  images: string[];
  index: number;
  alt: string;
}

interface ImageModalProps {
  state: ImageModalState | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  /** 넘기면 현재 보이는 이미지에 [ 이미지 삭제 ] 버튼이 뜬다 (nonDeletableIndex는 제외). */
  onDeleteImage?: (index: number) => void;
  /** 이 인덱스는 삭제 버튼을 보여주지 않는다. 예: 대표 이미지는 이 Modal에서 삭제하지 않는다. */
  nonDeletableIndex?: number;
}

function ModalImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-[50vh] w-[80vw] max-w-md flex-col items-center justify-center gap-3 bg-bg-soft text-star/50">
        <span className="text-2xl">✦</span>
        <span className="text-xs tracking-[0.2em] text-text-soft/50">IMAGE SOON</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- 라이트박스는 원본 비율을 그대로 보여줘야 해서 next/image의 고정 크기 요구사항과 맞지 않음
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="max-h-[85vh] max-w-[90vw] object-contain"
    />
  );
}

export default function ImageModal({
  state,
  onClose,
  onNavigate,
  onDeleteImage,
  nonDeletableIndex,
}: ImageModalProps) {
  const isOpen = state !== null;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!state) return;
    const { images, index } = state;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        onNavigate((index - 1 + images.length) % images.length);
      }
      if (e.key === "ArrowRight") {
        onNavigate((index + 1) % images.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, onClose, onNavigate]);

  const canDelete = state && onDeleteImage && state.index !== nonDeletableIndex;

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-2xl text-text/80 transition-colors hover:text-pink sm:right-6 sm:top-6"
          >
            ✕
          </button>

          {state.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate((state.index - 1 + state.images.length) % state.images.length);
                }}
                aria-label="이전 이미지"
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-3xl text-text/70 transition-colors hover:text-pink sm:left-6"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate((state.index + 1) % state.images.length);
                }}
                aria-label="다음 이미지"
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-3xl text-text/70 transition-colors hover:text-pink sm:right-6"
              >
                ›
              </button>
            </>
          )}

          <div onClick={(e) => e.stopPropagation()}>
            <ModalImage key={state.images[state.index]} src={state.images[state.index]} alt={state.alt} />
          </div>

          {canDelete && (
            <div className="absolute bottom-6 left-6">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteImage(state.index);
                }}
                className="border border-pink/30 bg-bg/70 px-4 py-2 text-xs tracking-[0.15em] text-pink/80 backdrop-blur-sm transition-colors hover:border-pink hover:text-pink"
              >
                [ 이미지 삭제 ]
              </button>
            </div>
          )}

          {state.images.length > 1 && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-text-soft">
              {state.index + 1} / {state.images.length}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
