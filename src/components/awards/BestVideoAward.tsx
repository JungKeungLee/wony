"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import type { VideoItem } from "@/lib/types";
import {
  getVideoEmbedUrl,
  getVideoWatchUrl,
  getWatchButtonLabel,
  resolveVideoThumbnail,
} from "@/lib/videoPlatform";
import { AWARDS_TEST_MODE } from "@/data/awards";
import { useMusic } from "@/context/MusicContext";

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
  | "count-pause"
  | "glow"
  | "winner-label"
  | "first-reveal";

const FINAL_STAGE: Stage = "first-reveal";

/** 각 단계가 얼마나 유지된 뒤 다음 단계로 넘어가는지(ms). 순서대로 누적해서
 * 타이머를 건다. first-reveal은 더 이상 스스로 넘어가지 않고 그대로 유지된다
 * (다음 Award로의 전환은 이 컴포넌트가 아니라, 사용자가 스크롤해서 다음 Award에
 * 들어갔을 때 그쪽에서 시작한다 - 스크롤을 강제로 잠그거나 자동으로 넘기지 않는다). */
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
  { stage: "count-pause", ms: 400 },
  { stage: "glow", ms: 400 },
  { stage: "winner-label", ms: 700 },
  { stage: FINAL_STAGE, ms: 0 },
];

/** dim 연출(화면이 살짝 어두워짐)이 유지되는 구간 - "glow" 단계에서 다시 밝아진다. */
const DIM_STAGES: Stage[] = [
  "dim",
  "announcing",
  "countdown-3",
  "countdown-2",
  "countdown-1",
  "count-pause",
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

/**
 * 기존 VIDEO 재생 로직(getVideoEmbedUrl/getVideoWatchUrl/resolveVideoThumbnail)을
 * 그대로 재사용하는 최소한의 재생 오버레이. VideoModal(수정/삭제/투표/이전-다음
 * 탐색)을 통째로 가져오지 않고, 1위 영상 재생에만 필요한 부분만 가볍게 다시
 * 구성했다 - AWARDS 프로토타입을 나중에 통째로 지울 때 다른 기능에 영향이
 * 없도록 하기 위함이다.
 */
function WinnerPlaybackModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  const { pauseForOverlay, resumeForOverlay } = useMusic();
  const [hasThumbError, setHasThumbError] = useState(false);
  const embedUrl = getVideoEmbedUrl(video.platform, video.video_id);
  const thumbnail = resolveVideoThumbnail(video);
  const watchUrl = getVideoWatchUrl(video.platform, video.video_id);

  useEffect(() => {
    pauseForOverlay();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      resumeForOverlay();
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onClose}
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
        className="w-full max-w-2xl border border-star/30 bg-bg-soft"
      >
        <div className="aspect-video w-full bg-black">
          {embedUrl ? (
            <iframe
              key={embedUrl}
              src={embedUrl}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-black/40 p-6 text-center">
              {thumbnail && !hasThumbError ? (
                // eslint-disable-next-line @next/next/no-img-element -- 외부 플랫폼 썸네일이라 next/image 대상이 아님
                <img
                  src={thumbnail}
                  alt={video.title}
                  onError={() => setHasThumbError(true)}
                  className="max-h-40 max-w-full object-contain opacity-80"
                />
              ) : (
                <span className="text-3xl text-star/50">▶</span>
              )}
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-text-soft/40 px-6 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-star hover:text-star"
              >
                {getWatchButtonLabel(video.platform)}
              </a>
            </div>
          )}
        </div>
        <div className="px-6 py-5 sm:px-8">
          <p className="font-serif-kr text-lg text-text sm:text-xl">{video.title}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function VideoThumbnail({
  video,
  tier,
  onOpen,
}: {
  video: VideoItem | null;
  tier: RankTier;
  onOpen?: () => void;
}) {
  const thumbnail = video ? resolveVideoThumbnail(video) : null;
  const isClickable = tier === "winner" && video && onOpen;

  const content = (
    <>
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
      {isClickable && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 hover:bg-black/20"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-xl text-text">
            ▶
          </span>
        </span>
      )}
    </>
  );

  const className = `relative aspect-video w-full max-w-md overflow-hidden border bg-bg-soft ${THUMBNAIL_BORDER_BY_TIER[tier]}`;

  if (isClickable) {
    return (
      <button type="button" onClick={onOpen} className={`${className} group`} aria-label={`${video.title} 재생`}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

/** 3위/2위/1위 발표 카드 - label(자막)과 함께 opacity+scale로 가볍게 나타난다.
 * tier에 따라 label/썸네일 border·glow/제목 크기가 단계적으로 커져서, 세
 * 순위가 같은 카드가 그냥 순서대로 나오는 것처럼 보이지 않게 한다
 * (calm=3위 차분하게, strong=2위 조금 더 강조, winner=1위 가장 강하게).
 * onOpen이 있으면(winner) 썸네일 클릭으로 기존 VIDEO 재생 방식을 그대로 연다. */
function RankCard({
  label,
  video,
  tier,
  onOpen,
}: {
  label: string;
  video: VideoItem | null;
  tier: RankTier;
  onOpen?: () => void;
}) {
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
      <VideoThumbnail video={video} tier={tier} onOpen={onOpen} />
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
 *   2026 IS..." -> 3-2-1 카운트다운 -> 짧은 pause -> 은은한 gold glow ->
 *   WINNER -> 1ST PLACE(가장 강하게, gold border+glow+작은 별빛, 최소
 *   2.5~3초 이상 유지, 이후 스스로 다음 단계로 넘어가지 않는다).
 *
 * 1위 썸네일을 클릭하면 기존 VIDEO 재생 로직(getVideoEmbedUrl 등)을 그대로
 * 재사용하는 작은 재생 오버레이가 뜬다(WinnerPlaybackModal) - VideoModal의
 * 수정/삭제/투표/이전-다음 탐색 UI는 가져오지 않는다.
 *
 * data/awards.ts의 AWARDS_TEST_MODE가 true인 동안은 best_rank를 전혀 보지
 * 않고 현재 등록된 영상 중 서로 다른 3개로 발표 연출만 미리 확인한다(videos
 * 테이블은 손대지 않는다). 실제 순위가 정해지면 그 상수만 false로 바꾸면
 * 이 컴포넌트는 자동으로 진짜 best_rank 데이터를 사용한다.
 *
 * 페이지는 일반 스크롤 페이지라 스크롤을 잠그지 않는다 - 발표 타이머는
 * (isInView && openingDone)이 모두 true가 된 뒤 딱 한 번만 시작되고
 * (hasStartedRef), 위아래로 다시 스크롤해도 처음부터 재실행되지 않는다.
 */
export default function BestVideoAward({ videos, openingDone }: BestVideoAwardProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [stage, setStage] = useState<Stage>(prefersReducedMotion ? FINAL_STAGE : "intro");
  const [isPlaybackOpen, setIsPlaybackOpen] = useState(false);
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

      {/* 카운트다운이 끝난 직후 한 번, 어둠이 걷히며 은은한 금빛이 짧게 번진다
          - 폭죽/불꽃놀이 같은 과한 효과가 아니라 부드러운 gold glow 한 번뿐이다. */}
      <AnimatePresence>
        {stage === "glow" && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="pointer-events-none fixed inset-0 z-30 bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,230,167,0.35),transparent_65%)]"
          />
        )}
      </AnimatePresence>

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
            <RankCard label="1ST PLACE" video={first} tier="winner" onOpen={() => setIsPlaybackOpen(true)} />
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

            {stage === "winner-label" && (
              <motion.span
                key="winner-label"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="font-display text-lg tracking-[0.3em] text-star drop-shadow-[0_0_14px_rgba(255,230,167,0.4)] sm:text-2xl"
              >
                WINNER
              </motion.span>
            )}

            {stage === FINAL_STAGE && (
              <motion.div
                key="first-reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full flex-col items-center gap-5"
              >
                <RankCard
                  label="1ST PLACE"
                  video={first}
                  tier="winner"
                  onOpen={first ? () => setIsPlaybackOpen(true) : undefined}
                />
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  className="font-serif-kr text-sm italic text-star/80 sm:text-base"
                >
                  2026년을 가장 빛낸 순간 ✦
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {isPlaybackOpen && first && (
          <WinnerPlaybackModal video={first} onClose={() => setIsPlaybackOpen(false)} />
        )}
      </AnimatePresence>
    </section>
  );
}
