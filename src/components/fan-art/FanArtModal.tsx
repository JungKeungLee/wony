"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { deleteFanArt, getFanArtImageUrl } from "@/lib/fanArt";
import { toErrorMessage } from "@/lib/letters";
import type { FanArt } from "@/lib/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface FanArtModalProps {
  arts: FanArt[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDeleted: (id: string) => void;
}

function ModalArtImage({ src }: { src: string }) {
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
      alt="팬아트"
      onError={() => setHasError(true)}
      className="max-h-[75vh] max-w-full object-contain"
    />
  );
}

/** 팬아트 확대 보기 - 이미지, 닫기, 이전/다음, 삭제만 있다(작성자/제목/메시지는 표시하지 않는다). */
export default function FanArtModal({ arts, index, onClose, onNavigate, onDeleted }: FanArtModalProps) {
  const art = index !== null ? arts[index] : null;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function closeModal() {
    setConfirmOpen(false);
    setDeleteError("");
    onClose();
  }

  function navigate(nextIndex: number) {
    setConfirmOpen(false);
    setDeleteError("");
    onNavigate(nextIndex);
  }

  async function handleConfirmDelete() {
    if (!art) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteFanArt(art);
      setConfirmOpen(false);
      setIsDeleting(false);
      onDeleted(art.id);
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(toErrorMessage(err, "팬아트를 삭제하지 못했습니다."));
    }
  }

  useEffect(() => {
    if (art === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (index === null) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") navigate((index - 1 + arts.length) % arts.length);
      if (e.key === "ArrowRight") navigate((index + 1) % arts.length);
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [art, index, arts.length]);

  return (
    <>
    <AnimatePresence>
      {art && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
        >
          <button
            type="button"
            onClick={closeModal}
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
                  navigate((index - 1 + arts.length) % arts.length);
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
                  navigate((index + 1) % arts.length);
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
            className="flex max-h-[85vh] max-w-3xl flex-col items-center"
          >
            <div className="flex items-center justify-center bg-black/30 p-4">
              <ModalArtImage key={art.image_path} src={getFanArtImageUrl(art.image_path)} />
            </div>

            {deleteError && <p className="mt-3 text-xs text-pink">{deleteError}</p>}

            <div className="mt-4 flex justify-center border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="border border-pink/30 px-4 py-1.5 text-[11px] tracking-[0.15em] text-pink/80 transition-colors hover:border-pink hover:text-pink"
              >
                팬아트 삭제
              </button>
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

    <ConfirmDialog
      open={confirmOpen}
      message="정말 이 팬아트를 삭제하시겠습니까?"
      isProcessing={isDeleting}
      onConfirm={handleConfirmDelete}
      onCancel={() => setConfirmOpen(false)}
    />
    </>
  );
}
