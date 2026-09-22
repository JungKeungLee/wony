"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMusic } from "@/context/MusicContext";
import { SURPRISE_ENDING_VIDEO_SRC } from "@/lib/constants";

/** BGM이 이 시간(ms)에 걸쳐 서서히 무음이 된 뒤 멈춘다. */
const BGM_FADE_MS = 2000;
/** 영상 종료 후 오버레이가 사라지는 fade-out 시간(초) - 검은 화면 없이 이 시간
 * 동안 서서히 투명해지면서 뒤에 있던 SURPRISE 페이지가 다시 드러난다. */
const OVERLAY_EXIT_DURATION_S = 1.8;
/** "See you in 2027 ✦" 제목이 viewport 세로 중심 부근(±이 비율만큼)에 들어오면
 * 트리거 조건을 만족한 것으로 본다. useAutoScroll의 CENTER_STOP_TOLERANCE_RATIO와
 * 반드시 같은 값을 쓴다 - 자동 스크롤이 멈추는 지점과 엔딩이 시작되는 지점이
 * 어긋나면 안 되기 때문이다. */
const CENTER_TRIGGER_TOLERANCE_RATIO = 0.125;
/** 자동 스크롤이 멈춘 뒤, "See you in 2027 ✦" 화면만 잠깐 더 보여주는 시간(ms). */
const HOLD_BEFORE_VIDEO_MS = 500;

type Stage = "idle" | "holding" | "playing";

interface SurpriseEndingVideoProps {
  /** "See you in 2027 ✦" 제목의 ref(SurpriseFinal이 붙인다). 이 제목이 viewport
   * 세로 중심 부근에 들어오는 순간을 기준으로 엔딩을 시작한다 - 페이지 맨
   * 아래까지 내려갈 필요는 없다. */
  finalMessageRef: RefObject<HTMLElement | null>;
}

/** el의 세로 중심이 viewport 세로 중심에 얼마나 가까운지 확인한다(useAutoScroll의
 * isNearViewportCenter와 동일한 기준 - 정확히 1px 단위로 맞을 필요는 없다). */
function isNearViewportCenter(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const elementCenter = rect.top + rect.height / 2;
  const viewportCenter = window.innerHeight / 2;
  const tolerance = window.innerHeight * CENTER_TRIGGER_TOLERANCE_RATIO;
  return Math.abs(elementCenter - viewportCenter) <= tolerance;
}

/**
 * SURPRISE 맨 마지막 진짜 엔딩. "See you in 2027 ✦" 제목이(자동 스크롤이든 사용자가
 * 직접 스크롤했든) viewport 세로 중심 부근에 들어오는 순간을 감지해서, 자동
 * 스크롤이 같은 조건으로 멈춘 직후 약 0.5초 그 화면을 더 보여준 뒤 전체화면
 * 오버레이로 전환되어 엔딩 영상이 자동재생된다. 브라우저 autoplay 정책으로 소리
 * 포함 재생이 막히면 수동 재생 버튼을 보여준다.
 *
 * 영상이 끝나면 검은 화면이나 마무리 문구로 전환하지 않는다 - 오버레이만 천천히
 * fade-out되고, 그 뒤에 계속 마운트돼 있던 /surprise 페이지(SurpriseFinal 등)가
 * 스크롤 위치 그대로 다시 드러난다. route 이동도, 리로드도, 자동스크롤 재개도,
 * BGM 재생도 전혀 일어나지 않는다 - 그냥 오버레이 하나가 사라질 뿐이다.
 *
 * 페이지당(이 컴포넌트가 마운트돼 있는 동안) 딱 한 번만 트리거된다 - 스크롤을
 * 위아래로 왔다 갔다 해도, 제목이 다시 중심 부근에 들어와도 처음부터 다시
 * 재생되지 않는다.
 */
export default function SurpriseEndingVideo({ finalMessageRef }: SurpriseEndingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { fadeOutAndStop } = useMusic();

  const [stage, setStage] = useState<Stage>("idle");
  const [needsManualStart, setNeedsManualStart] = useState(false);
  const hasTriggeredRef = useRef(false);

  // "See you in 2027 ✦" 제목이 viewport 세로 중심 부근에 들어오는지 스크롤/리사이즈
  // 때마다 확인한다(useAutoScroll이 같은 조건으로 자동 스크롤을 멈추는 것과는
  // 독립적으로 동작한다 - 자동 스크롤이 비활성화된 경우나 사용자가 직접 스크롤해서
  // 도달한 경우에도 똑같이 동작해야 하기 때문이다).
  useEffect(() => {
    if (hasTriggeredRef.current) return;

    let rafId: number | null = null;

    function checkCenter() {
      rafId = null;
      if (hasTriggeredRef.current) return;
      const el = finalMessageRef.current;
      if (el && isNearViewportCenter(el)) {
        hasTriggeredRef.current = true;
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
        setStage("holding");
      }
    }

    function handleScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(checkCenter);
    }

    // 마운트 시점에 이미 중심 부근일 수도 있으니 한 번 즉시 확인한다.
    checkCenter();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "holding" 상태로 잠깐(약 0.5초) 기존 화면을 더 보여준 뒤 영상 재생 단계로 넘어간다.
  useEffect(() => {
    if (stage !== "holding") return;
    const timer = window.setTimeout(() => setStage("playing"), HOLD_BEFORE_VIDEO_MS);
    return () => window.clearTimeout(timer);
  }, [stage]);

  // 영상 재생 단계로 들어서는 순간: BGM을 서서히 끄고, 영상 재생을 시도한다.
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
    // 있던 /surprise 페이지(같은 스크롤 위치의 "See you in 2027 ✦" 화면)가
    // 그대로 다시 보인다.
    setStage("idle");
  }

  return (
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
  );
}
