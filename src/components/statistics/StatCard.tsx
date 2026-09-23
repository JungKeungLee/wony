"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import type { HighlightStat } from "@/lib/types";

interface StatCardProps extends HighlightStat {
  delay?: number;
}

export default function StatCard({
  value,
  suffix = "",
  decimals = 0,
  label,
  description,
  featured = false,
  delay = 0,
}: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [isInView, value, delay]);

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
        <p
          className={`font-display text-text ${
            featured ? "text-5xl sm:text-7xl" : "text-3xl sm:text-4xl"
          }`}
        >
          {display.toFixed(decimals)}
          {suffix}
        </p>
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
