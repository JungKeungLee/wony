"use client";

import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import SurpriseOpening from "./SurpriseOpening";
import SurpriseIntro from "./SurpriseIntro";
import SurpriseMessage from "./SurpriseMessage";
import SurpriseMemories from "./SurpriseMemories";
import SurpriseCredits from "./SurpriseCredits";
import SurpriseFinal from "./SurpriseFinal";
import { useAutoScroll } from "./useAutoScroll";

export default function SurpriseExperience() {
  const prefersReducedMotion = useReducedMotion();
  const [introDone, setIntroDone] = useState(false);
  const finalSectionRef = useRef<HTMLElement>(null);
  const { state, pause, resume, controlRef } = useAutoScroll({
    stopAtRef: finalSectionRef,
    // 오프닝이 끝나기 전에는 자동 스크롤이 절대 움직이지 않는다.
    enabled: !prefersReducedMotion && introDone,
  });

  const showControl = state === "running" || state === "paused";

  return (
    <main className="relative">
      {!introDone && <SurpriseOpening onComplete={() => setIntroDone(true)} />}

      <SurpriseIntro ready={introDone} />
      <SurpriseMessage />
      <SurpriseMemories />
      <SurpriseCredits />
      <SurpriseFinal sectionRef={finalSectionRef} />

      {showControl && (
        <button
          ref={controlRef}
          type="button"
          onClick={state === "running" ? pause : resume}
          className="fixed bottom-6 right-6 z-40 border border-white/15 bg-bg/70 px-3 py-1.5 text-[10px] tracking-[0.15em] text-text-soft backdrop-blur-sm transition-colors hover:border-star hover:text-star"
        >
          {state === "running" ? "Ⅱ PAUSE" : "▶ AUTO SCROLL"}
        </button>
      )}
    </main>
  );
}
