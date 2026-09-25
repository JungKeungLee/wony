"use client";

import { useState } from "react";
import BestClipCard from "./BestClipCard";
import type { VideoItem } from "@/lib/types";
import HiddenStar from "@/components/effects/HiddenStar";
import { useSiteMode } from "@/context/SiteModeContext";
import BestVideoAwardOverlay from "@/components/awards/BestVideoAwardOverlay";

interface RankedClip {
  rank: 1 | 2 | 3;
  video: VideoItem;
}

export default function BestClipsSection({
  videos,
  allVideos,
  onOpen,
}: {
  /** best_rank가 있는 영상만(1~3위) - 기존 카드 표시용. */
  videos: VideoItem[];
  /** 승인된 전체 영상 목록 - WONY AWARDS 발표 연출(BestVideoAwardOverlay/
   * AWARDS_TEST_MODE)에 그대로 넘긴다. 이미 best_rank로 걸러진 videos만
   * 넘기면 테스트 모드에서 고를 영상이 없어진다. */
  allVideos: VideoItem[];
  onOpen: (video: VideoItem) => void;
}) {
  // 운영 계획: 11월 contribute(투표 기간)에는 결과를 미리 보여주지 않는다 -
  // WONY AWARDS 발표 보기도, best_rank 1/2/3 카드도 노출하지 않는다. 12월
  // public 전환 이후에만 이 섹션 전체가 보인다. VIDEO 목록/투표(VideoCard의
  // VoteButton)는 이 섹션과 무관하게 계속 그대로 동작한다.
  const { isContributeMode } = useSiteMode();
  const [isAwardOpen, setIsAwardOpen] = useState(false);

  if (isContributeMode) return null;

  const ranked = ([1, 2, 3] as const)
    .map((rank) => {
      const video = videos.find((v) => v.best_rank === rank);
      return video ? { rank, video } : null;
    })
    .filter((entry): entry is RankedClip => entry !== null);

  const first = ranked.find((entry) => entry.rank === 1);
  const rest = ranked.filter((entry) => entry.rank !== 1);

  return (
    <section className="relative mt-8 border-t border-white/10 pt-16 pb-32">
      <HiddenStar id="video" className="absolute right-5 top-6 sm:right-8 sm:top-8" />
      <span
        aria-hidden
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-bg px-3 text-sm text-star"
      >
        ✦
      </span>

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 text-center">
        <span className="font-display text-xs tracking-[0.4em] text-star">
          2026 BEST CLIPS
        </span>
        <h2 className="font-display text-3xl tracking-wide text-text sm:text-5xl">
          BEST OF THE YEAR
        </h2>
        <p className="font-serif-kr text-text-soft">
          워냥이들이 뽑은 올해 최고의 순간
        </p>
      </div>

      {/* WONY AWARDS 2026 CTA - 다른 route로 이동하지 않고, 이 페이지 위에
          전체화면 시상식 연출을 띄운다. */}
      <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 border border-star/25 bg-bg-soft/40 px-8 py-10 text-center">
        <span className="font-display text-[11px] tracking-[0.4em] text-star">
          WONY AWARDS 2026
        </span>
        <p className="font-serif-kr text-sm leading-relaxed text-text-soft sm:text-base">
          2026년,
          <br />
          가장 기억에 남았던 영상을 발표합니다.
        </p>
        <button
          type="button"
          onClick={() => setIsAwardOpen(true)}
          className="mt-1 border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-star hover:text-star"
        >
          [ BEST VIDEO 발표 보기 ✦ ]
        </button>
      </div>

      {ranked.length === 0 ? (
        <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-3 border border-white/10 bg-bg-soft/30 px-8 py-14 text-center">
          <span className="text-2xl text-star/60">✦</span>
          <p className="font-serif-kr text-text-soft">2026 BEST CLIPS 선정 중</p>
        </div>
      ) : (
        <>
          <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-5 px-6">
            {first && (
              <BestClipCard
                video={first.video}
                rank={first.rank}
                onOpen={() => onOpen(first.video)}
              />
            )}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {rest.map(({ rank, video }) => (
                  <BestClipCard key={video.id} video={video} rank={rank} onOpen={() => onOpen(video)} />
                ))}
              </div>
            )}
          </div>

          {/* 처음엔 발표 연출로 결과를 보고, 이후에는 이 카드들로 편하게 다시
              확인할 수 있다 - 원하면 언제든 발표 연출도 다시 볼 수 있다. */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setIsAwardOpen(true)}
              className="text-xs tracking-[0.15em] text-text-soft/60 transition-colors hover:text-star"
            >
              [ 시상식 다시 보기 ✦ ]
            </button>
          </div>
        </>
      )}

      <BestVideoAwardOverlay
        videos={allVideos}
        open={isAwardOpen}
        onClose={() => setIsAwardOpen(false)}
      />
    </section>
  );
}
