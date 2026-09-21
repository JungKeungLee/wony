"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getPlatformBadge, resolveVideoThumbnail } from "@/lib/videoPlatform";
import { getCategoryLabel } from "@/lib/videoCategory";
import type { VideoItem } from "@/lib/types";

interface BestClipCardProps {
  video: VideoItem;
  rank: 1 | 2 | 3;
  onOpen: () => void;
}

export default function BestClipCard({ video, rank, onOpen }: BestClipCardProps) {
  const [hasError, setHasError] = useState(false);
  const thumbnail = resolveVideoThumbnail(video);
  const isLarge = rank === 1;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay: (rank - 1) * 0.1 }}
      className="group flex flex-col overflow-hidden border border-star/20 bg-bg-soft/50 text-left transition-colors hover:border-star/50"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-bg-soft">
        {thumbnail && !hasError ? (
          // eslint-disable-next-line @next/next/no-img-element -- 외부 플랫폼 썸네일이라 next/image 대상이 아님
          <img
            src={thumbnail}
            alt={video.title}
            loading="lazy"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-star/50">
            <span className="text-2xl">▶</span>
            <span className="text-[11px] tracking-[0.15em] text-text-soft/50">
              {getPlatformBadge(video.platform)}
            </span>
          </div>
        )}

        <span
          className={`absolute left-2 top-2 border border-star/50 bg-black/70 tracking-[0.1em] text-star ${
            isLarge ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-[10px]"
          }`}
        >
          BEST #{rank}
        </span>
        <span className="absolute right-2 top-2 border border-white/20 bg-black/60 px-2 py-1 text-[10px] tracking-[0.15em] text-text-soft">
          {getPlatformBadge(video.platform)}
        </span>

        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-xl text-text">
            ▶
          </span>
        </span>
      </div>

      <div className={`flex flex-col gap-1 px-4 ${isLarge ? "py-5" : "py-3"}`}>
        <span className="text-[10px] tracking-[0.1em] text-text-soft/60">
          {getCategoryLabel(video.category)}
        </span>
        <p className={`font-serif-kr text-text ${isLarge ? "text-lg sm:text-2xl" : "text-sm sm:text-base"}`}>
          {video.title}
        </p>
      </div>
    </motion.button>
  );
}
