"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface StatusToastProps {
  message: string | null;
  onDismiss: () => void;
}

/** 수정/삭제 완료 등 짧은 안내를 잠시 보여주고 자동으로 사라지는 공용 토스트. */
export default function StatusToast({ message, onDismiss }: StatusToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 2600);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 border border-white/15 bg-bg-soft px-5 py-3 text-xs tracking-[0.15em] text-text shadow-lg"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
