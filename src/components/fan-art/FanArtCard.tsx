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
      className="group relative mb-5 block w-full break-inside-avoid overflow-hidden border border-white/10 bg-bg-soft/50 text-left focus:outline-none focus-visible:border-pink/50"
    >
      {hasError ? (
        <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 text-star/50">
          <span className="text-2xl">✦</span>
          <span className="text-[11px] tracking-[0.15em] text-text-soft/50">
            이미지를 불러올 수 없습니다
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- 사용자 업로드 이미지(Supabase Storage)를 원본 비율 그대로 masonry로 배치해야 함
        <img
          src={getFanArtImageUrl(art.image_path)}
          alt={art.title}
          loading="lazy"
          onError={() => setHasError(true)}
          className="block w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-4 pt-12">
        <p className="font-serif-kr truncate text-sm text-text sm:text-base">
          {art.title}
        </p>
        <p className="text-xs text-text-soft">From. {art.nickname}</p>
        {art.message && (
          <p className="font-serif-kr mt-2 max-h-0 overflow-hidden text-xs italic text-pink/90 opacity-0 transition-all duration-300 group-hover:max-h-20 group-hover:opacity-100 group-focus-visible:max-h-20 group-focus-visible:opacity-100">
            {art.message}
          </p>
        )}
      </div>
    </motion.button>
  );
}
