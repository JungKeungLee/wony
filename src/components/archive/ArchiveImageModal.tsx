"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { getArchiveImageUrl } from "@/lib/archiveImages";
import { toErrorMessage } from "@/lib/letters";
import type { ArchiveImage } from "@/lib/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ArchiveImageModalProps {
  archiveId: string | null;
  image: ArchiveImage | null;
  onClose: () => void;
  onReplace: (archiveId: string) => void;
  onDelete: (archiveId: string) => Promise<void>;
}

export default function ArchiveImageModal({
  archiveId,
  image,
  onClose,
  onReplace,
  onDelete,
}: ArchiveImageModalProps) {
  const isOpen = archiveId !== null && image !== null;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function closeModal() {
    setConfirmOpen(false);
    setIsDeleting(false);
    setDeleteError("");
    onClose();
  }

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function handleConfirmDelete() {
    if (!archiveId) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await onDelete(archiveId);
      setConfirmOpen(false);
      setIsDeleting(false);
    } catch (err) {
      setConfirmOpen(false);
      setIsDeleting(false);
      setDeleteError(toErrorMessage(err, "이미지를 삭제하지 못했습니다."));
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && image && archiveId && (
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

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto border border-white/10 bg-bg-soft"
            >
              <div className="relative aspect-video w-full bg-black">
                <Image
                  key={image.image_path}
                  src={getArchiveImageUrl(image.image_path)}
                  alt="대표 이미지"
                  fill
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-3 px-6 py-6 sm:px-8">
                {deleteError && <p className="text-xs text-pink">{deleteError}</p>}

                <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => onReplace(archiveId)}
                    className="border border-white/15 px-5 py-2 text-xs tracking-[0.15em] text-text-soft transition-colors hover:border-text-soft/60 hover:text-text"
                  >
                    이미지 변경
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    className="border border-pink/30 px-5 py-2 text-xs tracking-[0.15em] text-pink/80 transition-colors hover:border-pink hover:text-pink"
                  >
                    이미지 삭제
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        message="이 대표 이미지를 정말 삭제하시겠습니까?"
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
