"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import type { HighlightStat } from "@/lib/types";
import HiddenStar from "@/components/effects/HiddenStar";

interface StatCardProps extends HighlightStat {
  delay?: number;
  /** statistics-number 후보 슬롯이 카드마다 반복되지 않도록, 첫 번째 카드에서만 true. */
  showDiamond?: boolean;
}

export default function StatCard({
  value,
  suffix = "",
  decimals = 0,
  label,
  description,
  featured = false,
  delay = 0,
  showDiamond = false,
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
      className={`relative flex flex-col items-center gap-2 border border-white/10 bg-bg-soft/50 px-6 text-center ${
        featured ? "py-10 sm:py-12" : "py-7"
      }`}
    >
      {showDiamond && (
        <HiddenStar
          id="statistics"
          variant="statistics-number"
          className="absolute -right-3 -top-3 sm:-right-4 sm:-top-4"
        />
      )}
      <p
        className={`font-display text-text ${
          featured ? "text-5xl sm:text-7xl" : "text-3xl sm:text-4xl"
        }`}
      >
        {display.toFixed(decimals)}
        {suffix}
      </p>
      <p
        className={`tracking-[0.3em] text-star ${featured ? "text-xs sm:text-sm" : "text-[11px]"}`}
      >
        {label}
      </p>
      <p className="text-xs text-text-soft sm:text-sm">{description}</p>
    </motion.div>
  );
}
