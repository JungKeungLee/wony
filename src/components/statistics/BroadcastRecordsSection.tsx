"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import RankedRecordSection from "./RankedRecordSection";
import { BROADCAST_STATS_2026, formatDuration } from "@/data/broadcastStats";

const stats = BROADCAST_STATS_2026;

/** 카드 UI 없이 숫자만 크게 보여주는 간단한 count-up (MOST ACTIVE MONTH의
 * 351, MARATHON STREAMS의 5). StatCard처럼 once-only + prefers-reduced-motion
 * 안전 처리를 그대로 따르되, 바로 사용하기엔 StatCard의 카드 테두리 디자인이
 * 이 두 섹션의 "스포트라이트" 느낌과 맞지 않아 가볍게 따로 뒀다. */
function useBareCountUp(target: number, isInView: boolean) {
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;
    const controls = animate(0, target, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [isInView, target, prefersReducedMotion]);

  return prefersReducedMotion ? (isInView ? target : 0) : display;
}

function MostActiveMonthSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hours = useBareCountUp(stats.mostActiveMonth.hours, isInView);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 py-16 text-center sm:py-20"
    >
      <span className="font-display text-xs tracking-[0.4em] text-star">MOST ACTIVE MONTH</span>
      <p className="font-display text-5xl tracking-wide text-text sm:text-7xl">
        {stats.mostActiveMonth.month}
      </p>
      <p className="font-display text-xl text-star sm:text-2xl">{Math.round(hours)} HOURS</p>
      <p className="font-serif-kr text-text-soft">{stats.mostActiveMonth.descriptionKo}</p>
    </motion.section>
  );
}

function MarathonStreamsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useBareCountUp(stats.marathonStreams.length, isInView);

  return (
    <section ref={ref} className="mx-auto max-w-2xl px-6 py-16 text-center sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="flex flex-col items-center gap-2 pb-10"
      >
        <span className="font-display text-xs tracking-[0.4em] text-star">MARATHON STREAMS</span>
        <p className="font-display text-6xl text-text sm:text-8xl">{Math.round(count)}</p>
        <p className="text-sm tracking-[0.2em] text-star">24H+ STREAMS</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col gap-3"
      >
        {stats.marathonStreams.map((s) => (
          <div
            key={`${s.date}-${s.title}`}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/10 pb-3 text-left"
          >
            <span className="text-xs tracking-[0.1em] text-text-soft">{s.date}</span>
            <span className="font-serif-kr break-keep text-sm text-text sm:text-base">{s.title}</span>
            <span className="font-display text-sm text-star sm:text-base">{s.duration}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function LongestStreamHighlight() {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="mx-auto flex max-w-md flex-col items-center gap-4 border border-star/25 bg-bg-soft/40 px-6 py-16 text-center sm:py-20"
    >
      <span className="font-display text-xs tracking-[0.4em] text-star">LONGEST STREAM</span>
      <p className="font-display text-6xl tracking-wide text-text drop-shadow-[0_0_18px_rgba(255,230,167,0.2)] sm:text-8xl">
        {stats.longestStream.duration}
      </p>
      <p className="text-xs tracking-[0.15em] text-text-soft">{stats.longestStream.date}</p>
      <p className="font-serif-kr whitespace-pre-line text-base italic leading-relaxed text-text sm:text-lg">
        {stats.longestStream.quote}
      </p>
    </motion.section>
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

/** 기존에 있던 보조 기록(10/12시간 이상, 3시간 미만, 최단 방송)을 조용한
 * 에필로그 블록으로 유지한다 - 새 스토리텔링 흐름(월간 -> 콘텐츠 -> 게임 ->
 * 마라톤 -> 최장 방송)을 방해하지 않도록 맨 마지막, 작게 배치했다. */
function MoreRecordsEpilogue() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mx-auto max-w-2xl px-6 pb-20 pt-10"
    >
      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 pb-6 text-center">
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
    </motion.div>
  );
}

/**
 * STATISTICS 페이지의 "연말결산" 스토리텔링 블록. BY THE NUMBERS(page.tsx의
 * StatCard 4개) 다음, 기존 MONTHLY 차트 이후에 이어진다. 기존 다크 네이비
 * 배경 + border+bg-bg-soft/50 카드 + font-display/font-serif-kr + star(gold)
 * 포인트를 그대로 재사용했고 새 색상/폰트/이미지/영상은 추가하지 않았다.
 *
 * 흐름: MOST ACTIVE MONTH -> LONGEST CONTENT -> MOST FEATURED GAMES ->
 * MARATHON STREAMS -> LONGEST STREAM -> (조용한 보조 기록 에필로그).
 * 기본 통계에서 점점 더 재미있는 기록으로 이어지도록 순서를 그대로 따랐다.
 */
export default function BroadcastRecordsSection() {
  return (
    <>
      <MostActiveMonthSection />

      <RankedRecordSection
        title="LONGEST CONTENT"
        subtitle="가장 오래 함께했던 콘텐츠"
        items={stats.contents}
        footnote="콘텐츠 진행 기간의 방송시간을 기준으로 집계"
      />

      <RankedRecordSection
        title="MOST FEATURED GAMES"
        subtitle="2026 다시보기에 가장 많이 등장한 게임"
        items={stats.games}
        footnote="VOD 제목에 등장한 게임을 기준으로 집계"
      />

      <MarathonStreamsSection />
      <LongestStreamHighlight />
      <MoreRecordsEpilogue />
    </>
  );
}
