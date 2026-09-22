"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getPlatformBadge, resolveVideoThumbnail } from "@/lib/videoPlatform";
import { getCategoryLabel } from "@/lib/videoCategory";
import { VIDEO_VOTING_ENABLED } from "@/lib/constants";
import VoteButton from "./VoteButton";
import type { VideoItem } from "@/lib/types";

interface VideoCardProps {
  video: VideoItem;
  delay?: number;
  onOpen: () => void;
}

export default function VideoCard({ video, delay = 0, onOpen }: VideoCardProps) {
  const [hasError, setHasError] = useState(false);
  const thumbnail = resolveVideoThumbnail(video);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className="group flex flex-col overflow-hidden border border-white/10 bg-bg-soft/50 transition-colors hover:border-pink/50"
    >
      <button type="button" onClick={onOpen} className="flex flex-col text-left">
        <div className="relative aspect-video w-full overflow-hidden bg-bg-soft">
          {thumbnail && !hasError ? (
            // eslint-disable-next-line @next/next/no-img-element -- 외부 플랫폼 썸네일(YouTube 등)이라 next/image 대상이 아님
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

          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            <span className="border border-white/20 bg-black/60 px-2 py-1 text-[10px] tracking-[0.15em] text-text">
              {getPlatformBadge(video.platform)}
            </span>
            <span className="border border-white/20 bg-black/60 px-2 py-1 text-[10px] tracking-[0.15em] text-text-soft">
              {getCategoryLabel(video.category)}
            </span>
          </div>

          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-xl text-text">
              ▶
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-1 px-4 py-4">
          <p className="font-serif-kr truncate text-sm text-text sm:text-base">
            {video.title}
          </p>
        </div>
      </button>

      {VIDEO_VOTING_ENABLED && (
        <div className="px-4 pb-4">
          <VoteButton videoId={video.id} />
        </div>
      )}
    </motion.div>
  );
}
