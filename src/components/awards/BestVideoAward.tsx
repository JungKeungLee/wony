"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import type { VideoItem } from "@/lib/types";
import { resolveVideoThumbnail } from "@/lib/videoPlatform";
import { AWARDS_TEST_MODE } from "@/data/awards";

type Stage =
  | "intro"
  | "third-label"
  | "third-reveal"
  | "second-label"
  | "second-reveal"
  | "dim"
  | "announcing"
  | "countdown-3"
  | "countdown-2"
  | "countdown-1"
  | "first-label"
  | "first-reveal";

const FINAL_STAGE: Stage = "first-reveal";

/** 각 단계가 얼마나 유지된 뒤 다음 단계로 넘어가는지(ms). 순서대로 누적해서
 * 타이머를 건다 - 마지막 first-reveal은 더 이상 넘어가지 않으므로 ms가 의미 없다.
 * 합이 대략 12초 안팎이 되도록 잡았다(요청: 전체 BEST VIDEO 구간 12~18초). */
const STAGE_SEQUENCE: { stage: Stage; ms: number }[] = [
  { stage: "intro", ms: 1000 },
  { stage: "third-label", ms: 700 },
  { stage: "third-reveal", ms: 2300 },
  { stage: "second-label", ms: 700 },
  { stage: "second-reveal", ms: 2600 },
  { stage: "dim", ms: 600 },
  { stage: "announcing", ms: 1100 },
  { stage: "countdown-3", ms: 750 },
  { stage: "countdown-2", ms: 750 },
  { stage: "countdown-1", ms: 750 },
  { stage: "first-label", ms: 600 },
  { stage: FINAL_STAGE, ms: 0 },
];

/** dim 연출(화면이 살짝 어두워짐)이 유지되는 구간 - first-reveal 직전까지. */
const DIM_STAGES: Stage[] = [
  "dim",
  "announcing",
  "countdown-3",
  "countdown-2",
  "countdown-1",
  "first-label",
];

interface RankedVideos {
  third: VideoItem | null;
  second: VideoItem | null;
  first: VideoItem | null;
}

function findRank(videos: VideoItem[], rank: 1 | 2 | 3): VideoItem | null {
  return videos.find((v) => v.best_rank === rank) ?? null;
}

/**
 * AWARDS_TEST_MODE=true일 때만 쓰는 임시 데이터. videos.best_rank는 전혀
 * 보지 않고, 현재 등록된 영상 중 서로 다른 3개를 골라 3위/2위/1위 자리에
 * 각각 매핑한다 - 화면/연출 확인용이라 실제 Supabase 데이터는 손대지 않는다.
 */
function pickTestVideos(videos: VideoItem[]): RankedVideos {
  return {
    third: videos[0] ?? null,
    second: videos[1] ?? null,
    first: videos[2] ?? null,
  };
}

function pickRankedVideos(videos: VideoItem[]): RankedVideos {
  if (AWARDS_TEST_MODE) return pickTestVideos(videos);
  return {
    third: findRank(videos, 3),
    second: findRank(videos, 2),
    first: findRank(videos, 1),
  };
}

interface BestVideoAwardProps {
  /** 승인된 전체 영상 목록 - best_rank가 있는 것만 이 안에서 골라 쓴다. */
  videos: VideoItem[];
  /** AwardsOpening이 완전히 사라진 뒤에만 true. 오프닝이 화면을 덮고 있는
   * 동안 발표 타이머가 몰래 진행되는 것을 막기 위한 게이트다. */
  openingDone: boolean;
}

type RankTier = "calm" | "strong" | "winner";

const THUMBNAIL_BORDER_BY_TIER: Record<RankTier, string> = {
  calm: "border-star/25 shadow-[0_0_14px_rgba(255,230,167,0.08)]",
  strong: "border-star/60 shadow-[0_0_22px_rgba(255,230,167,0.15)]",
  winner: "border-star shadow-[0_0_36px_rgba(255,230,167,0.25)]",
};

const LABEL_CLASS_BY_TIER: Record<RankTier, string> = {
  calm: "text-xs text-star/75",
  strong: "text-sm text-star sm:text-base",
  winner: "text-base text-star drop-shadow-[0_0_10px_rgba(255,230,167,0.4)] sm:text-lg",
};

const TITLE_CLASS_BY_TIER: Record<RankTier, string> = {
  calm: "text-base sm:text-lg",
  strong: "text-lg sm:text-xl",
  winner: "text-xl sm:text-2xl",
};

function VideoThumbnail({ video, tier }: { video: VideoItem | null; tier: RankTier }) {
  const thumbnail = video ? resolveVideoThumbnail(video) : null;

  return (
    <div
      className={`relative aspect-video w-full max-w-md overflow-hidden border bg-bg-soft ${THUMBNAIL_BORDER_BY_TIER[tier]}`}
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
      {tier === "winner" && (
        <>
          <span aria-hidden className="pointer-events-none absolute -inset-px border border-star/40" />
          <span aria-hidden className="pointer-events-none absolute left-3 top-3 text-xs text-star/70">
            ✦
          </span>
          <span aria-hidden className="pointer-events-none absolute bottom-3 right-3 text-[10px] text-star/50">
            ✦
          </span>
        </>
      )}
    </div>
  );
}

/** 3위/2위/1위 발표 카드 - label(자막)과 함께 opacity+scale로 가볍게 나타난다.
 * tier에 따라 label/썸네일 border·glow/제목 크기가 단계적으로 커져서, 세
 * 순위가 같은 카드가 그냥 순서대로 나오는 것처럼 보이지 않게 한다
 * (calm=3위 차분하게, strong=2위 조금 더 강조, winner=1위 가장 강하게). */
function RankCard({ label, video, tier }: { label: string; video: VideoItem | null; tier: RankTier }) {
  return (
    <motion.div
      key={label}
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex w-full flex-col items-center gap-4"
    >
      <span className={`font-display tracking-[0.3em] ${LABEL_CLASS_BY_TIER[tier]}`}>{label}</span>
      <VideoThumbnail video={video} tier={tier} />
      <p className={`font-serif-kr text-text ${TITLE_CLASS_BY_TIER[tier]}`}>
        {video ? video.title : "선정 준비 중"}
      </p>
    </motion.div>
  );
}

function CountdownNumber({ value }: { value: "3" | "2" | "1" }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="font-display text-6xl text-star drop-shadow-[0_0_18px_rgba(255,230,167,0.45)] sm:text-8xl"
    >
      {value}
    </motion.span>
  );
}

/**
 * BEST VIDEO OF THE YEAR 전용 발표 연출(시상식처럼 순위별로 차이를 두고 천천히
 * 진행된다). 기존 videos 테이블의 best_rank(1~3)를 그대로 재사용하고(투표수는
 * 절대 표시하지 않는다), 아래 순서로 자동 진행된다(클릭 불필요):
 *
 *   진입 -> "2026년, 가장 많은 기억을 남긴 영상들" -> 3RD PLACE(차분하게) ->
 *   2ND PLACE(조금 더 강조) -> 화면이 살짝 어두워짐 -> "AND THE BEST VIDEO OF
 *   2026 IS..." -> 3-2-1 카운트다운 -> WINNER/1ST PLACE(가장 강하게, gold
 *   border+glow+작은 별빛)
 *
 * data/awards.ts의 AWARDS_TEST_MODE가 true인 동안은 best_rank를 전혀 보지
 * 않고 현재 등록된 영상 중 서로 다른 3개로 발표 연출만 미리 확인한다(videos
 * 테이블은 손대지 않는다). 실제 순위가 정해지면 그 상수만 false로 바꾸면
 * 이 컴포넌트는 자동으로 진짜 best_rank 데이터를 사용한다.
 *
 * 이전 버전은 "isInView가 되는 즉시" 타이머를 시작했는데, 이 섹션이 페이지
 * 맨 위 오프닝 바로 다음이라 오프닝이 화면을 덮고 있는 동안(약 2.2~2.8초)
 * 이미 isInView가 true가 되어 3위 발표 구간이 그 뒤에서 몰래 지나가버렸다 -
 * 그래서 실제로는 2위부터 보이는 것처럼 보였다. 이번에는 openingDone prop이
 * true가 된 뒤에만 타이머를 시작하도록 게이트를 추가해 근본 원인을 고쳤다.
 */
export default function BestVideoAward({ videos, openingDone }: BestVideoAwardProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [stage, setStage] = useState<Stage>(prefersReducedMotion ? FINAL_STAGE : "intro");
  const hasStartedRef = useRef(false);
  const timerIdsRef = useRef<number[]>([]);

  function clearAllTimers() {
    timerIdsRef.current.forEach((id) => window.clearTimeout(id));
    timerIdsRef.current = [];
  }

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!isInView || !openingDone) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let elapsed = 0;
    STAGE_SEQUENCE.forEach((_, i) => {
      if (i === 0) return; // 첫 stage(intro)는 이미 초기 상태로 보이는 중이라 타이머가 필요 없다.
      elapsed += STAGE_SEQUENCE[i - 1].ms;
      const nextStage = STAGE_SEQUENCE[i].stage;
      const id = window.setTimeout(() => setStage(nextStage), elapsed);
      timerIdsRef.current.push(id);
    });

    return () => clearAllTimers();
  }, [isInView, openingDone, prefersReducedMotion]);

  function handleSkip() {
    clearAllTimers();
    setStage(FINAL_STAGE);
  }

  const { third, second, first } = pickRankedVideos(videos);
  const isDimActive = DIM_STAGES.includes(stage);
  const countdownValue =
    stage === "countdown-3" ? "3" : stage === "countdown-2" ? "2" : stage === "countdown-1" ? "1" : null;

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto flex max-w-lg flex-col items-center gap-8 px-6 py-16 text-center sm:py-20"
    >
      {/* dim 단계들에서 화면 전체가 살짝 어두워진다 - 불꽃놀이 같은 과한 연출
          없이, 다음 발표를 기다리는 긴장감을 표현하는 정도. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30 bg-black"
        animate={{ opacity: isDimActive ? 0.4 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      {!prefersReducedMotion && stage !== FINAL_STAGE && (
        <button
          type="button"
          onClick={handleSkip}
          className="absolute right-3 top-3 z-50 text-[10px] tracking-[0.15em] text-text-soft/30 transition-colors hover:text-star/70"
        >
          [ SKIP ]
        </button>
      )}

      <div className="relative z-40 flex flex-col items-center gap-2">
        <span className="font-display text-xs tracking-[0.4em] text-star sm:text-sm">
          BEST VIDEO OF THE YEAR
        </span>
        <AnimatePresence>
          {stage === "intro" && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-serif-kr text-sm text-text-soft sm:text-base"
            >
              2026년, 가장 많은 기억을 남긴 영상들
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-40 flex min-h-[300px] w-full flex-col items-center justify-center gap-3">
        {prefersReducedMotion ? (
          <div className="flex w-full flex-col items-center gap-10">
            <RankCard label="3RD PLACE" video={third} tier="calm" />
            <RankCard label="2ND PLACE" video={second} tier="strong" />
            <RankCard label="1ST PLACE" video={first} tier="winner" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {stage === "third-label" && (
              <motion.span
                key="third-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="font-display text-xs tracking-[0.3em] text-star/75"
              >
                3RD PLACE
              </motion.span>
            )}
            {stage === "third-reveal" && <RankCard label="3RD PLACE" video={third} tier="calm" />}

            {stage === "second-label" && (
              <motion.div
                key="second-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="font-serif-kr text-xs italic text-text-soft/70">NEXT AWARD</span>
                <span className="font-display text-sm tracking-[0.3em] text-star">2ND PLACE</span>
              </motion.div>
            )}
            {stage === "second-reveal" && <RankCard label="2ND PLACE" video={second} tier="strong" />}

            {stage === "announcing" && (
              <motion.p
                key="announcing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="font-serif-kr max-w-xs text-base italic text-star sm:text-lg"
              >
                AND THE BEST VIDEO OF 2026 IS...
              </motion.p>
            )}

            {countdownValue && (
              <motion.div key="countdown" className="flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <CountdownNumber key={countdownValue} value={countdownValue} />
                </AnimatePresence>
              </motion.div>
            )}

            {stage === "first-label" && (
              <motion.span
                key="first-label"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="font-display text-lg tracking-[0.3em] text-star drop-shadow-[0_0_14px_rgba(255,230,167,0.4)] sm:text-2xl"
              >
                WINNER
              </motion.span>
            )}

            {stage === FINAL_STAGE && <RankCard label="1ST PLACE" video={first} tier="winner" />}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
