"use client";

import { motion } from "framer-motion";
import { INTRO_VIDEO_SRC } from "@/lib/constants";

interface IntroVideoProps {
  /** 영상이 자연 종료/SKIP/로딩 실패로 끝났을 때 - 셋 다 다음 단계(스마트폰)로 넘어간다. */
  onFinished: () => void;
}

/**
 * 오프닝 영상 단계. "문자 도착 → 워니가 휴대폰을 확인" 장면만 담당하고, 영상이 끝나는
 * 즉시(자연 종료/SKIP/로딩 실패 모두 동일하게) 스마트폰 단계로 넘어간다. 네이티브
 * controls를 렌더링하지 않고 picture-in-picture/전체화면 진입을 유도할 만한 요소도
 * 두지 않아, 브라우저의 전체화면 비디오 플레이어가 열리지 않는다.
 */
export default function IntroVideo({ onFinished }: IntroVideoProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className="absolute inset-0 flex items-center justify-center bg-black"
    >
      <video
        src={INTRO_VIDEO_SRC}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        controlsList="nodownload noplaybackrate nofullscreen"
        onEnded={onFinished}
        onError={onFinished}
        className="h-full w-full object-contain"
      />

      <button
        type="button"
        onClick={onFinished}
        className="absolute right-4 top-4 z-10 text-[10px] tracking-[0.25em] text-text-soft/60 transition-colors hover:text-text sm:right-6 sm:top-6"
      >
        SKIP
      </button>
    </motion.div>
  );
}
