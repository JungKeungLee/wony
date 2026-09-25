"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import type { VideoItem } from "@/lib/types";
import { resolveVideoThumbnail } from "@/lib/videoPlatform";

type Stage = "third" | "second" | "announcing" | "first";

/** viewport에 들어온 뒤 각 단계가 시작되는 시점(ms) - 한 단계당 넉넉히 머문다. */
const STAGE_START_MS: Record<Stage, number> = {
  third: 500,
  second: 2100,
  announcing: 3700,
  first: 4900,
};

interface BestVideoAwardProps {
  /** 승인된 전체 영상 목록 - best_rank가 있는 것만 이 안에서 골라 쓴다. */
  videos: VideoItem[];
}

function findRank(videos: VideoItem[], rank: 1 | 2 | 3): VideoItem | null {
  return videos.find((v) => v.best_rank === rank) ?? null;
}

function RankReveal({
  label,
  video,
  isLarge = false,
}: {
  label: string;
  video: VideoItem | null;
  isLarge?: boolean;
}) {
  const thumbnail = video ? resolveVideoThumbnail(video) : null;

  return (
    <motion.div
      key={label}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex w-full flex-col items-center gap-4"
    >
      <span
        className={`font-display tracking-[0.3em] ${
          isLarge ? "text-sm text-star sm:text-base" : "text-xs text-star/80"
        }`}
      >
        {label}
      </span>

      <div
        className={`relative aspect-video w-full max-w-md overflow-hidden border bg-bg-soft ${
          isLarge ? "border-star shadow-[0_0_28px_rgba(255,230,167,0.18)]" : "border-white/10"
        }`}
      >
        {video ? (
          thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element -- 외부 플랫폼/Storage 썸네일이라 next/image 대상이 아님
            <img src={thumbnail} alt={video.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-star/40">
              <span className="text-2xl">▶</span>
            </div>
          )
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-soft/50">
            <span className="text-xl text-star/40">✦</span>
            <span className="text-xs tracking-[0.15em]">선정 준비 중</span>
          </div>
        )}
        {isLarge && (
          <span aria-hidden className="pointer-events-none absolute -inset-px border border-star/40" />
        )}
      </div>

      <p className={`font-serif-kr text-text ${isLarge ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}`}>
        {video ? video.title : "선정 준비 중"}
      </p>
    </motion.div>
  );
}

/**
 * BEST VIDEO OF THE YEAR 전용 발표 연출. 기존 videos 테이블의 best_rank(1~3)를
 * 그대로 재사용하고(투표수는 절대 표시하지 않는다), 3위 -> 2위 -> (화면이 살짝
 * 어두워지며) "AND THE BEST VIDEO OF 2026 IS..." -> 1위 순서로 한 번에 하나씩만
 * 자동으로 전환된다. best_rank 데이터가 없는 순위는 "선정 준비 중"으로 대체되며,
 * 페이지 전체가 깨지지 않는다. 클릭 등 사용자 조작은 필요 없다.
 */
export default function BestVideoAward({ videos }: BestVideoAwardProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [stage, setStage] = useState<Stage>(prefersReducedMotion ? "first" : "third");

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;
    const timers = (Object.keys(STAGE_START_MS) as Stage[])
      .filter((key) => key !== "third")
      .map((key) => window.setTimeout(() => setStage(key), STAGE_START_MS[key]));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [isInView, prefersReducedMotion]);

  const third = findRank(videos, 3);
  const second = findRank(videos, 2);
  const first = findRank(videos, 1);

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto flex max-w-lg flex-col items-center gap-8 px-6 py-16 text-center sm:py-20"
    >
      {/* announcing 단계에서 화면 전체가 살짝 어두워진다 - 불꽃놀이 같은 과한
          연출 없이, 다음 발표를 기다리는 짧은 pause를 표현하는 정도. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30 bg-black"
        animate={{ opacity: stage === "announcing" ? 0.35 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      <span className="font-display text-xs tracking-[0.4em] text-star sm:text-sm">
        BEST VIDEO OF THE YEAR
      </span>

      <div className="relative z-40 flex min-h-[280px] w-full flex-col items-center justify-center">
        {prefersReducedMotion ? (
          <div className="flex w-full flex-col items-center gap-10">
            <RankReveal label="3RD PLACE" video={third} />
            <RankReveal label="2ND PLACE" video={second} />
            <RankReveal label="1ST PLACE" video={first} isLarge />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {stage === "third" && <RankReveal label="3RD PLACE" video={third} />}
            {stage === "second" && <RankReveal label="2ND PLACE" video={second} />}
            {stage === "announcing" && (
              <motion.p
                key="announcing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="font-serif-kr text-base italic text-star sm:text-lg"
              >
                AND THE BEST VIDEO OF 2026 IS...
              </motion.p>
            )}
            {stage === "first" && <RankReveal label="1ST PLACE" video={first} isLarge />}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
