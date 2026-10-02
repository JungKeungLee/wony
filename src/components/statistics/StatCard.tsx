"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import type { HighlightStat } from "@/lib/types";

interface StatCardProps extends HighlightStat {
  delay?: number;
}

export default function StatCard({
  value,
  suffix = "",
  decimals = 0,
  secondaryValue = 0,
  format,
  label,
  description,
  featured = false,
  delay = 0,
}: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const [secondaryDisplay, setSecondaryDisplay] = useState(0);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;
    const controls = [
      animate(0, value, {
        duration: 1.4,
        delay,
        ease: "easeOut",
        onUpdate: setDisplay,
      }),
      animate(0, secondaryValue, {
        duration: 1.4,
        delay,
        ease: "easeOut",
        onUpdate: setSecondaryDisplay,
      }),
    ];
    return () => controls.forEach((c) => c.stop());
  }, [isInView, value, secondaryValue, delay, prefersReducedMotion]);

  // prefers-reduced-motion이면 애니메이션 없이 바로 최종 숫자를 보여준다 - 이
  // 값은 effect에서 setState로 만들지 않고 렌더링 중 그냥 계산한다.
  const shown = prefersReducedMotion ? (isInView ? value : 0) : display;
  const shownSecondary = prefersReducedMotion ? (isInView ? secondaryValue : 0) : secondaryDisplay;
  const formatted = format ? format(shown, shownSecondary) : `${shown.toFixed(decimals)}${suffix}`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className={`flex flex-col items-center justify-center gap-2 border border-white/10 bg-bg-soft/50 px-6 text-center ${
        featured ? "py-10 sm:py-12" : "py-7"
      }`}
    >
      {/* featured 카드와 일반 카드의 숫자 글자 크기가 달라도(5xl/7xl vs 3xl/4xl)
          이 영역의 높이를 공통으로 고정해, 숫자의 시각적 중심이 카드마다 항상
          같은 높이에 오도록 한다. */}
      <div className="flex min-h-[3rem] w-full items-center justify-center sm:min-h-[4.5rem]">
        {featured ? (
          <p className="font-display text-5xl text-text sm:text-7xl">{formatted}</p>
        ) : (
          // 일반(non-featured) 카드는 기존보다 한 단계 큰 크기를 써서 featured
          // 카드 옆에 있어도 존재감이 약해 보이지 않게 한다.
          <p className="font-display text-4xl text-text sm:text-5xl">{formatted}</p>
        )}
      </div>
      {/* label도 featured 여부에 따라 글자 크기가 미세하게 달라(11px vs xs/sm)
          같은 이유로 높이를 고정해 정렬을 맞춘다. */}
      <div className="flex min-h-[1.25rem] w-full items-center justify-center sm:min-h-[1.5rem]">
        <p
          className={`tracking-[0.3em] text-star ${featured ? "text-xs sm:text-sm" : "text-[11px]"}`}
        >
          {label}
        </p>
      </div>
      <p className="text-xs text-text-soft sm:text-sm">{description}</p>
    </motion.div>
  );
}
