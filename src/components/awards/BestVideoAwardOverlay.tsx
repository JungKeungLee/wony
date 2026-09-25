"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { VideoItem } from "@/lib/types";
import BestVideoAwardSequence from "./BestVideoAwardSequence";

interface BestVideoAwardOverlayProps {
  videos: VideoItem[];
  open: boolean;
  onClose: () => void;
  /** 1위 발표까지 정상적으로(또는 SKIP으로) 완료됐을 때 한 번 호출된다 - 도중에
   * X로 닫으면 호출되지 않는다. /videos가 이 신호로 TOP 3 결과 공개 여부를 정한다. */
  onCompleted?: () => void;
}

/**
 * /videos 페이지 위에 뜨는 전체화면 시상식 오버레이. route 이동 없이(router.push
 * 없음) /videos 위에 그대로 얹히고, 닫으면 오버레이만 사라지고 /videos는 스크롤
 * 위치까지 그대로다 - position: fixed라 문서 스크롤 위치 자체를 건드리지 않고,
 * 열려 있는 동안만 배경 스크롤을 잠갔다가 닫을 때 정확히 원래대로 되돌린다.
 *
 * 발표 연출 자체(BEST VIDEO OF THE YEAR)는 /awards 프로토타입과 동일한
 * BestVideoAwardSequence를 그대로 재사용한다 - 코드를 복사하지 않는다.
 *
 * "다시 보기": open이 false가 되면 아래 AnimatePresence가 exit 애니메이션 뒤
 * BestVideoAwardSequence를 완전히 언마운트한다. 다시 open이 true가 되면 새
 * 인스턴스가 마운트되며 stage/countdown/재생 상태가 전부 초기값으로 자연스럽게
 * 리셋된다 - 별도의 리셋 로직이 필요 없다.
 */
export default function BestVideoAwardOverlay({
  videos,
  open,
  onClose,
  onCompleted,
}: BestVideoAwardOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[95] overflow-y-auto bg-bg"
        >
          {/* 발표 도중 실수로 닫히지 않도록 아주 작고 옅게 - 기본 종료 방법은
              아래 시퀀스 끝의 [ VIDEO로 돌아가기 ] 버튼이다. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="fixed right-4 top-4 z-[96] text-base text-text-soft/25 transition-colors hover:text-star/60 sm:right-6 sm:top-6"
          >
            ✕
          </button>

          <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 py-16">
            <span className="font-display text-[10px] tracking-[0.4em] text-star/70">
              WONY AWARDS 2026
            </span>
            <BestVideoAwardSequence
              videos={videos}
              active={open}
              onClose={onClose}
              onCompleted={onCompleted}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
