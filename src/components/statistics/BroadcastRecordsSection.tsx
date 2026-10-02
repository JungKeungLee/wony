"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import BroadcastStatCard from "./BroadcastStatCard";
import { BROADCAST_STATS_2026, formatDuration } from "@/data/broadcastStats";

const stats = BROADCAST_STATS_2026;

const CARDS: {
  index: string;
  primaryValue: number;
  secondaryValue?: number;
  format: (primary: number, secondary: number) => string;
  label: string;
  description: string;
}[] = [
  {
    index: "01",
    primaryValue: stats.vodCount,
    format: (v) => `${Math.round(v)}`,
    label: "VOD",
    description: "2026년에 남겨진 방송 기록",
  },
  {
    index: "02",
    primaryValue: stats.broadcastDays,
    format: (v) => `${Math.round(v)}`,
    label: "DAYS",
    description: "워니가 방송을 켠 날",
  },
  {
    index: "03",
    primaryValue: stats.totalHours,
    format: (v) => `${Math.round(v).toLocaleString("en-US")}`,
    label: "HOURS",
    description: "함께했던 총 방송시간",
  },
  {
    index: "04",
    primaryValue: stats.averageHours,
    secondaryValue: stats.averageMinutes,
    format: (h, m) => `${Math.round(h)}H ${Math.round(m)}M`,
    label: "AVERAGE",
    description: "한 번 방송을 켜면 평균 이만큼",
  },
  {
    index: "05",
    primaryValue: stats.longestHours,
    secondaryValue: stats.longestMinutes,
    format: (h, m) => `${Math.round(h)}H ${Math.round(m)}M`,
    label: "LONGEST",
    description: "가장 길었던 하루",
  },
];

/** FEATURED RECORD용 "2,762" 단독 count-up - BroadcastStatCard의 카드 UI 없이
 * 숫자만 아주 크게 보여준다. 이 섹션에서 가장 중요한 숫자로 취급한다. */
function FeaturedHoursNumber() {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;
    const controls = animate(0, stats.totalHours, {
      duration: 2,
      ease: "easeOut",
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [isInView, prefersReducedMotion]);

  // prefers-reduced-motion이면 애니메이션 없이 바로 최종 숫자를 보여준다 - 이
  // 값은 effect에서 setState로 만들지 않고 렌더링 중 그냥 계산한다.
  const shown = prefersReducedMotion ? (isInView ? stats.totalHours : 0) : display;

  return (
    <p
      ref={ref}
      className="font-display text-6xl tracking-wide text-text sm:text-8xl"
    >
      {Math.round(shown).toLocaleString("en-US")}
      <span className="ml-2 text-3xl text-star sm:text-4xl">HOURS</span>
    </p>
  );
}

function MiniRecord({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 border border-white/10 bg-bg-soft/30 px-4 py-5 text-center">
      <p className="font-display text-xl text-text sm:text-2xl">{value}</p>
      <p className="text-[11px] tracking-[0.1em] text-text-soft sm:text-xs">{label}</p>
    </div>
  );
}

/**
 * "2026 방송 기록" 섹션. 핵심 기록 5개(카운트업 카드) -> 가장 중요한 숫자인
 * 총 방송시간을 강조하는 FEATURED RECORD -> 간단한 추가 기록(MORE RECORDS) ->
 * 최장 방송 하이라이트 순으로 구성했다. 기존 STATISTICS 페이지의 다크 네이비
 * 배경, gold(star) 포인트, font-display/font-serif-kr, border+bg-bg-soft/50
 * 카드 스타일을 그대로 재사용했다 - 새 색상/폰트는 추가하지 않았다.
 */
export default function BroadcastRecordsSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 pb-12 text-center">
        <span className="font-display text-xs tracking-[0.4em] text-star">2026 ON AIR</span>
        <h2 className="font-display text-3xl tracking-wide text-text sm:text-5xl">
          워니와 함께한 2026년
        </h2>
        <p className="font-serif-kr text-text-soft">숫자로 다시 보는 우리의 2026년</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((card, i) => (
          <BroadcastStatCard
            key={card.index}
            {...card}
            delay={i * 0.08}
            className={i === CARDS.length - 1 ? "col-span-2 sm:col-span-1" : ""}
          />
        ))}
      </div>

      {/* FEATURED RECORD - 이 섹션에서 가장 중요한 숫자(총 방송시간)를
          카드 하나보다 훨씬 큰, 연말결산 느낌의 여백 있는 블록으로 강조한다. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="mt-16 flex flex-col items-center gap-5 border-y border-white/10 py-16 text-center sm:py-24"
      >
        <span className="font-display text-xs tracking-[0.4em] text-star">FEATURED RECORD</span>
        <FeaturedHoursNumber />
        <p className="font-serif-kr max-w-sm text-base leading-relaxed text-text sm:text-lg">
          2026년,
          <br />
          우리가 함께했던 시간.
        </p>
        <p className="text-sm text-text-soft sm:text-base">
          {formatDuration(stats.totalHours, stats.totalMinutes, stats.totalSeconds)}
        </p>
      </motion.div>

      {/* MORE RECORDS - 복잡한 표 대신 작은 기록 카드 4개만 보여준다. */}
      <div className="mt-16">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-2 pb-8 text-center">
          <span className="font-display text-xs tracking-[0.3em] text-star">MORE RECORDS</span>
          <p className="font-serif-kr text-sm text-text-soft">조금 더 자세히 보면</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniRecord value={`${stats.over10HoursCount}회`} label="10시간 이상 방송" />
          <MiniRecord value={`${stats.over12HoursCount}회`} label="12시간 이상 방송" />
          <MiniRecord value={`${stats.under3HoursCount}회`} label="3시간 미만 방송" />
          <MiniRecord
            value={formatDuration(0, stats.shortestMinutes, stats.shortestSeconds)}
            label="가장 짧은 방송"
          />
        </div>
      </div>

      {/* LONGEST STREAM 하이라이트 - 48:30:11 숫자가 가장 먼저 눈에 들어오게 한다. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="mt-16 flex flex-col items-center gap-4 border border-star/20 bg-bg-soft/40 px-6 py-14 text-center sm:py-16"
      >
        <span className="font-display text-xs tracking-[0.4em] text-star">LONGEST STREAM</span>
        <p className="font-display text-5xl tracking-wide text-text sm:text-7xl">
          {String(stats.longestHours).padStart(2, "0")}:{String(stats.longestMinutes).padStart(2, "0")}:
          {String(stats.longestSeconds).padStart(2, "0")}
        </p>
        <p className="text-xs tracking-[0.15em] text-text-soft">{stats.longestStreamDate}</p>
        <blockquote className="font-serif-kr max-w-sm text-base italic leading-relaxed text-text sm:text-lg">
          &ldquo;{stats.longestStreamQuote}&rdquo;
        </blockquote>
        <p className="text-sm text-text-soft sm:text-base">
          무려 {formatDuration(stats.longestHours, stats.longestMinutes, stats.longestSeconds)}.
        </p>
      </motion.div>
    </section>
  );
}
