"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  confirmLabel?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 삭제 등 되돌릴 수 없는 작업 전에 한 번 더 확인받는 공용 모달. */
export default function ConfirmDialog({
  open,
  message,
  confirmLabel = "확인",
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-xs flex-col gap-6 border border-white/15 bg-bg-soft px-6 py-7 text-center"
          >
            <p className="font-serif-kr text-sm leading-relaxed text-text sm:text-base">
              {message}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="border border-white/15 px-5 py-2 text-xs tracking-[0.15em] text-text-soft transition-colors hover:border-text-soft/60 hover:text-text disabled:opacity-40"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isProcessing}
                className="border border-pink/50 px-5 py-2 text-xs tracking-[0.15em] text-pink transition-colors hover:bg-pink/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isProcessing ? "삭제하는 중..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
