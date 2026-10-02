"use client";

import { motion } from "framer-motion";
import type { RecordStat } from "@/lib/types";

/**
 * "가장 긴 방송" 등 4개 기록 카드. 작은 라벨 -> (월간 기록이면 월 이름 badge) ->
 * 가장 큰 핵심 숫자(value) -> 작은 보조 정보(detail) -> 방송 멘트(quote) ->
 * 맨 아래 작은 설명 순으로, 숫자가 가장 먼저 눈에 들어오도록 우선순위를
 * 명확히 했다. 4개 카드 모두 value를 같은 크기로 통일해 시각적 무게가
 * 비슷하게 보이도록 하고, justify-center로 내용 길이가 카드마다 달라도
 * (일부만 quote가 있음) 세로 중앙에 자연스럽게 놓이게 한다.
 */
export default function RecordCard({
  title,
  badge,
  value,
  detail,
  quote,
  description,
  delay = 0,
}: RecordStat & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className="flex flex-col items-center justify-center gap-2 border border-white/10 bg-bg-soft/50 px-6 py-8 text-center"
    >
      <p className="break-keep text-xs tracking-[0.2em] text-text-soft">{title}</p>

      {badge && (
        <p className="font-display text-lg text-star sm:text-xl">{badge}</p>
      )}

      <p className="font-display whitespace-nowrap text-3xl text-text sm:text-4xl">
        {value}
      </p>

      {detail && (
        <p className="text-xs tracking-[0.1em] text-text-soft">{detail}</p>
      )}

      {quote && (
        <p className="font-serif-kr whitespace-pre-line break-keep text-sm italic leading-relaxed text-pink/80">
          {quote}
        </p>
      )}

      {description && (
        <p className="break-keep text-xs text-text-soft/80 sm:text-sm">{description}</p>
      )}
    </motion.div>
  );
}
