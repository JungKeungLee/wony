"use client";

import { motion } from "framer-motion";
import type { BroadcastRankedRecord } from "@/lib/types";

interface RankedRecordSectionProps {
  /** 예: "LONGEST CONTENT" */
  title: string;
  subtitle: string;
  items: BroadcastRankedRecord[];
  /** 집계 기준을 밝히는 작은 안내 문구, 예: "콘텐츠 진행 기간의 방송시간을 기준으로 집계" */
  footnote: string;
}

/**
 * LONGEST CONTENT / MOST FEATURED GAMES가 공유하는 TOP 3 레이아웃. 기존
 * TopList와 같은 "순위 숫자는 pink, 이름은 serif-kr" 조합을 그대로 쓰되,
 * 여기서는 순위 번호(01/02/03)를 카드 안에서 더 크게 디자인 요소로 쓴다.
 * PC에서는 3개가 가로로, 모바일에서는 세로로 쌓인다. 긴 한글 콘텐츠명도
 * 줄바꿈으로 자연스럽게 흘러가도록 폭 제한이나 truncate를 쓰지 않는다.
 */
export default function RankedRecordSection({
  title,
  subtitle,
  items,
  footnote,
}: RankedRecordSectionProps) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 pb-10 text-center">
        <span className="font-display text-xs tracking-[0.4em] text-star">{title}</span>
        <p className="font-serif-kr break-keep text-text-soft">{subtitle}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {items.map((item) => (
          <div
            key={item.rank}
            className="flex flex-col items-center gap-2 border border-white/10 bg-bg-soft/50 px-5 py-8 text-center"
          >
            <span className="font-display text-3xl text-pink/70 sm:text-4xl">
              {String(item.rank).padStart(2, "0")}
            </span>
            <p className="font-serif-kr break-keep text-lg text-text sm:text-xl">{item.name}</p>
            <p className="font-display text-2xl text-star sm:text-3xl">{item.hours}H</p>
            <p className="text-xs text-text-soft">{item.detail}</p>
          </div>
        ))}
      </motion.div>

      <p className="mt-6 break-keep text-center text-[11px] text-text-soft/50">{footnote}</p>
    </section>
  );
}
