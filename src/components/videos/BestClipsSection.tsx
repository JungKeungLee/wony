"use client";

import BestClipCard from "./BestClipCard";
import type { VideoItem } from "@/lib/types";
import HiddenStar from "@/components/effects/HiddenStar";

interface RankedClip {
  rank: 1 | 2 | 3;
  video: VideoItem;
}

export default function BestClipsSection({
  videos,
  onOpen,
}: {
  videos: VideoItem[];
  onOpen: (video: VideoItem) => void;
}) {
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
      <HiddenStar
        id="video"
        variant="video-best"
        className="absolute right-5 top-6 sm:right-8 sm:top-8"
      />
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

      {ranked.length === 0 ? (
        <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-3 border border-white/10 bg-bg-soft/30 px-8 py-14 text-center">
          <span className="text-2xl text-star/60">✦</span>
          <p className="font-serif-kr text-text-soft">2026 BEST CLIPS 선정 중</p>
        </div>
      ) : (
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
      )}
    </section>
  );
}
