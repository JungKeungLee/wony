"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMusic } from "@/context/MusicContext";
import { SURPRISE_ENDING_VIDEO_SRC } from "@/lib/constants";

/** BGM이 이 시간(ms)에 걸쳐 서서히 무음이 된 뒤 멈춘다. */
const BGM_FADE_MS = 2000;
/** 영상 종료 후 오버레이가 사라지는 fade-out 시간(초) - 검은 화면 없이 이 시간
 * 동안 서서히 투명해지면서 뒤에 있던 SURPRISE 페이지가 다시 드러난다. */
const OVERLAY_EXIT_DURATION_S = 1.8;
/** "충분히 화면에 들어왔다"고 판단할 교차 비율. */
const TRIGGER_THRESHOLD = 0.6;

type Stage = "idle" | "playing";

/**
 * SURPRISE 맨 마지막 진짜 엔딩. Credits/See you in 2027 다음에 이어지는 빈 섹션을
 * 스크롤로 지나치다가(사용자가 직접 스크롤해야만) 화면에 충분히 들어오면 전체화면
 * 오버레이로 전환되어 엔딩 영상이 자동재생된다. 브라우저 autoplay 정책으로 소리
 * 포함 재생이 막히면 수동 재생 버튼을 보여준다.
 *
 * 영상이 끝나면 검은 화면이나 마무리 문구로 전환하지 않는다 - 오버레이만 천천히
 * fade-out되고, 그 뒤에 계속 마운트돼 있던 /surprise 페이지(SurpriseFinal 등)가
 * 스크롤 위치 그대로 다시 드러난다. route 이동도, 리로드도, 자동스크롤 재개도,
 * BGM 재생도 전혀 일어나지 않는다 - 그냥 오버레이 하나가 사라질 뿐이다.
 *
 * 페이지당(이 컴포넌트가 마운트돼 있는 동안) 딱 한 번만 트리거된다 - 스크롤을
 * 위아래로 왔다 갔다 해도, 영상이 다시 viewport에 들어와도 처음부터 다시
 * 재생되지 않는다.
 */
export default function SurpriseEndingVideo() {
  const sentinelRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { fadeOutAndStop } = useMusic();

  const [stage, setStage] = useState<Stage>("idle");
  const [needsManualStart, setNeedsManualStart] = useState(false);
  const hasTriggeredRef = useRef(false);

  // 사용자가 실제로 이 섹션까지 스크롤했을 때만(자동 스크롤은 그 전에 이미 멈춰
  // 있다) IntersectionObserver로 감지해서 딱 한 번 엔딩을 시작한다.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || hasTriggeredRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || hasTriggeredRef.current) return;
        if (entry.isIntersecting && entry.intersectionRatio >= TRIGGER_THRESHOLD) {
          hasTriggeredRef.current = true;
          observer.disconnect();
          setStage("playing");
        }
      },
      { threshold: [0, TRIGGER_THRESHOLD, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 엔딩이 시작되는 순간: BGM을 서서히 끄고, 영상 재생을 시도한다.
  useEffect(() => {
    if (stage !== "playing") return;

    fadeOutAndStop(BGM_FADE_MS);

    const video = videoRef.current;
    if (!video) return;
    video
      .play()
      .then(() => setNeedsManualStart(false))
      .catch(() => {
        // 브라우저 autoplay 정책으로 소리 포함 재생이 막힌 경우 - 사용자가 직접
        // 눌러야 하는 버튼을 보여준다(클릭은 명확한 사용자 제스처라 항상 허용된다).
        setNeedsManualStart(true);
      });
  }, [stage, fadeOutAndStop]);

  function handleManualStart() {
    const video = videoRef.current;
    if (!video) return;
    video
      .play()
      .then(() => setNeedsManualStart(false))
      .catch(() => {
        // 그래도 실패하면(파일 자체가 없는 경우 등) 조용히 버튼을 그대로 둔다.
      });
  }

  function handleEnded() {
    // 검은 화면/문구로 전환하지 않는다 - "playing" 오버레이 자체를 걷어내면
    // AnimatePresence의 exit 애니메이션이 천천히 fade-out시키고, 그 아래 계속
    // 있던 /surprise 페이지가 그대로 다시 보인다.
    setStage("idle");
  }

  return (
    <>
      {/* 실제 콘텐츠 없이 스크롤 흐름에서 "여기까지 내려오면 엔딩"의 기준점 역할만
          한다. 엔딩이 시작된 뒤에는 다시 관찰할 필요가 없다. */}
      <section ref={sentinelRef} className="min-h-svh" aria-hidden />

      <AnimatePresence>
        {stage === "playing" && (
          <motion.div
            key="surprise-ending-video"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: prefersReducedMotion ? 0.3 : 1.2, ease: "easeOut" },
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: prefersReducedMotion ? 0.3 : OVERLAY_EXIT_DURATION_S,
                ease: "easeInOut",
              },
            }}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/92"
          >
            <video
              ref={videoRef}
              src={SURPRISE_ENDING_VIDEO_SRC}
              autoPlay
              playsInline
              onEnded={handleEnded}
              className="max-h-[100vh] max-w-full object-contain"
            />
            {needsManualStart && (
              <button
                type="button"
                onClick={handleManualStart}
                className="absolute border border-white/30 bg-black/60 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-star hover:text-star"
              >
                [ 마지막 영상 보기 ]
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
