"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getFanArtImageUrl } from "@/lib/fanArt";
import type { FanArt } from "@/lib/types";

interface FanArtCardProps {
  art: FanArt;
  delay?: number;
  onOpen: () => void;
}

/** 팬아트는 오직 이미지만 보여준다 - 작성자/제목/메시지는 표시하지 않는다. */
export default function FanArtCard({ art, delay = 0, onOpen }: FanArtCardProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className="group relative block aspect-square w-full overflow-hidden border border-white/10 bg-bg-soft/50 focus:outline-none focus-visible:border-pink/50"
    >
      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-star/50">
          <span className="text-2xl">✦</span>
          <span className="text-[11px] tracking-[0.15em] text-text-soft/50">
            이미지를 불러올 수 없습니다
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- 사용자 업로드 이미지(Supabase Storage) 썸네일
        <img
          src={getFanArtImageUrl(art.image_path)}
          alt="팬아트"
          loading="lazy"
          onError={() => setHasError(true)}
          className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
      )}
    </motion.button>
  );
}
