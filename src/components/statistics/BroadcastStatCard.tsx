"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";

/** 기존 StatCard의 count-up 패턴과 동일하되, "9H 51M"처럼 두 숫자가 함께
 * 올라가는 경우도 지원하도록 값을 2개(primary/secondary)까지 받는다. */
const COUNT_UP_DURATION = 1.8;

interface BroadcastStatCardProps {
  /** "01" ~ "05" 같은 순번 라벨. */
  index: string;
  primaryValue: number;
  /** "9H 51M"처럼 두 번째 숫자가 필요할 때만 넘긴다. */
  secondaryValue?: number;
  /** count-up 중간값을 받아 실제 표시 문자열을 만든다. */
  format: (primary: number, secondary: number) => string;
  label: string;
  description: string;
  delay?: number;
  className?: string;
}

/**
 * "2026 방송 기록" 섹션의 핵심 숫자 카드. 기존 StatCard와 같은 once-only
 * useInView + framer-motion animate() count-up 패턴을 쓰지만, prefers-reduced-
 * motion이면 애니메이션 없이 바로 최종 숫자를 보여준다(StatCard는 이 처리가
 * 없었는데, 이번에 요청받은 부분이라 여기서는 명시적으로 넣었다).
 */
export default function BroadcastStatCard({
  index,
  primaryValue,
  secondaryValue = 0,
  format,
  label,
  description,
  delay = 0,
  className = "",
}: BroadcastStatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const [primaryDisplay, setPrimaryDisplay] = useState(0);
  const [secondaryDisplay, setSecondaryDisplay] = useState(0);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;

    const controls = [
      animate(0, primaryValue, {
        duration: COUNT_UP_DURATION,
        delay,
        ease: "easeOut",
        onUpdate: setPrimaryDisplay,
      }),
      animate(0, secondaryValue, {
        duration: COUNT_UP_DURATION,
        delay,
        ease: "easeOut",
        onUpdate: setSecondaryDisplay,
      }),
    ];
    return () => controls.forEach((c) => c.stop());
  }, [isInView, primaryValue, secondaryValue, delay, prefersReducedMotion]);

  // prefers-reduced-motion이면 애니메이션 없이 바로 최종 숫자를 보여준다 - 이
  // 값은 effect에서 setState로 만들지 않고 렌더링 중 그냥 계산한다.
  const shownPrimary = prefersReducedMotion ? (isInView ? primaryValue : 0) : primaryDisplay;
  const shownSecondary = prefersReducedMotion ? (isInView ? secondaryValue : 0) : secondaryDisplay;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className={`flex flex-col items-center justify-center gap-2 border border-white/10 bg-bg-soft/50 px-4 py-8 text-center sm:px-6 ${className}`}
    >
      <span className="font-display text-[11px] tracking-[0.3em] text-text-soft/50">
        {index}
      </span>
      <p className="font-display text-4xl text-text sm:text-5xl">
        {format(shownPrimary, shownSecondary)}
      </p>
      <p className="text-xs tracking-[0.3em] text-star sm:text-sm">{label}</p>
      <p className="text-xs text-text-soft sm:text-sm">{description}</p>
    </motion.div>
  );
}
