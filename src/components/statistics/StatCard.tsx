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
  allowWrap = false,
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
      className={`min-w-0 flex flex-col items-center justify-center gap-2 overflow-hidden border border-white/10 bg-bg-soft/50 px-6 text-center ${
        featured ? "py-10 sm:py-12" : "py-7"
      }`}
    >
      {/* featured 카드와 일반 카드의 숫자 글자 크기가 달라도 이 영역의 높이를
          공통으로 고정해, 숫자의 시각적 중심이 카드마다 항상 같은 높이에
          오도록 한다. min-w-0 + overflow-hidden은 grid/flex item이 기본값인
          "콘텐츠보다 좁아지지 않음" 때문에 카드 자체가 넓어지는 것을 막는
          안전장치다 - clamp()가 정상 동작하면 실제로 잘릴 일은 없다. */}
      <div className="flex min-h-[3rem] w-full min-w-0 items-center justify-center overflow-hidden sm:min-h-[4.5rem]">
        {featured ? (
          <p className="font-display text-5xl text-text sm:text-7xl">{formatted}</p>
        ) : (
          // 일반(non-featured) 카드는 숫자가 커져도(연말 최종 집계 후
          // 2,762H -> 3,000H+ 등) 카드 폭을 벗어나지 않도록 뷰포트 폭에 따라
          // 유연하게 줄어드는 clamp()를 쓴다. 2단 그리드(모바일)/4단 그리드
          // (sm: 이상)에서 실제 카드 폭이 다르게 변하기 때문에, 두 구간에
          // 각각 안전하게 맞춘 별도의 clamp 값을 쓴다 - 하나의 공식으로
          // viewport 전 구간을 커버하려 하면 2->4단으로 바뀌는 지점(sm:)
          // 바로 앞뒤에서 카드 폭이 갑자기 좁아져 오히려 넘칠 수 있다.
          <p
            className={`font-display text-text text-[clamp(1.1rem,5.8vw,1.8rem)] sm:text-[clamp(1.1rem,3vw,2.1rem)] ${
              allowWrap ? "" : "whitespace-nowrap"
            }`}
          >
            {formatted}
          </p>
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
