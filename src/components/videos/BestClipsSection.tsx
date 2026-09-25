"use client";

import { useState } from "react";
import BestClipCard from "./BestClipCard";
import type { VideoItem } from "@/lib/types";
import HiddenStar from "@/components/effects/HiddenStar";
import { useSiteMode } from "@/context/SiteModeContext";
import BestVideoAwardOverlay from "@/components/awards/BestVideoAwardOverlay";
import { pickRankedVideos } from "@/components/awards/rankedVideos";

interface RankedClip {
  rank: 1 | 2 | 3;
  video: VideoItem;
}

export default function BestClipsSection({
  allVideos,
  onOpen,
}: {
  /** 승인된 전체 영상 목록. WONY AWARDS 발표 연출과 발표 완료 후 TOP 3 표시
   * 둘 다, 같은 rankedVideos.pickRankedVideos()로 이 목록에서 순위를 골라
   * 쓴다 - 발표에서 본 영상과 카드로 다시 보는 영상이 항상 같아야 하기 때문. */
  allVideos: VideoItem[];
  onOpen: (video: VideoItem) => void;
}) {
  // 운영 계획: 11월 contribute(투표 기간)에는 결과를 미리 보여주지 않는다 -
  // WONY AWARDS 발표 보기도, TOP 3 결과도 노출하지 않는다. 12월 public 전환
  // 이후에만 이 섹션 전체가 보인다. VIDEO 목록/투표(VideoCard의 VoteButton)는
  // 이 섹션과 무관하게 계속 그대로 동작한다.
  const { isContributeMode } = useSiteMode();
  const [isAwardOpen, setIsAwardOpen] = useState(false);
  // 이번 세션에 시상식을 끝까지(또는 SKIP으로) 본 적이 있는지 - true가 된 뒤에는
  // 다시 보기를 해도 계속 true로 유지된다. 이게 true가 되기 전까지는 실제
  // best_rank 데이터가 있어도 "2026 BEST CLIPS 선정 중"만 보여준다 - 결과를
  // 발표로 먼저 확인하기 전에 카드로 미리 노출되면 안 되기 때문이다.
  const [awardCompleted, setAwardCompleted] = useState(false);

  if (isContributeMode) return null;

  const { first, second, third } = pickRankedVideos(allVideos);
  const ranked: RankedClip[] = (
    [
      first && { rank: 1 as const, video: first },
      second && { rank: 2 as const, video: second },
      third && { rank: 3 as const, video: third },
    ] as (RankedClip | null)[]
  ).filter((entry): entry is RankedClip => entry !== null);

  const rest = ranked.filter((entry) => entry.rank !== 1);
  const firstEntry = ranked.find((entry) => entry.rank === 1);

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
          전체화면 시상식 연출을 띄운다. 발표를 한 번 완료하면 버튼 문구만
          "시상식 다시 보기"로 바뀐다 - 카드 디자인은 그대로. */}
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
          {awardCompleted ? "[ 시상식 다시 보기 ✦ ]" : "[ BEST VIDEO 발표 보기 ✦ ]"}
        </button>
      </div>

      {!awardCompleted ? (
        <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-3 border border-white/10 bg-bg-soft/30 px-8 py-14 text-center">
          <span className="text-2xl text-star/60">✦</span>
          <p className="font-serif-kr text-text-soft">2026 BEST CLIPS 선정 중</p>
        </div>
      ) : (
        <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-5 px-6">
          {firstEntry && (
            <BestClipCard
              video={firstEntry.video}
              rank={firstEntry.rank}
              onOpen={() => onOpen(firstEntry.video)}
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
      )}

      <BestVideoAwardOverlay
        videos={allVideos}
        open={isAwardOpen}
        onClose={() => setIsAwardOpen(false)}
        onCompleted={() => setAwardCompleted(true)}
      />
    </section>
  );
}
