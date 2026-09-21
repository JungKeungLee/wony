"use client";

import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import SurpriseOpening from "./SurpriseOpening";
import SurpriseIntro from "./SurpriseIntro";
import SurpriseMontage from "./SurpriseMontage";
import SurpriseMessage from "./SurpriseMessage";
import SurpriseMemories from "./SurpriseMemories";
import SurpriseMessageStars from "./SurpriseMessageStars";
import SurpriseCredits from "./SurpriseCredits";
import SurpriseFinal from "./SurpriseFinal";
import { useAutoScroll } from "./useAutoScroll";

export default function SurpriseExperience() {
  const prefersReducedMotion = useReducedMotion();
  const [introDone, setIntroDone] = useState(false);
  const [montageDone, setMontageDone] = useState(false);
  const finalSectionRef = useRef<HTMLElement>(null);
  const { state, pause, resume, controlRef } = useAutoScroll({
    stopAtRef: finalSectionRef,
    // 오프닝과 사진 몽타주가 모두 끝나기 전에는 자동 스크롤이 절대 움직이지 않는다.
    enabled: !prefersReducedMotion && introDone && montageDone,
  });

  const showControl = state === "running" || state === "paused";

  return (
    <main className="relative">
      {!introDone && <SurpriseOpening onComplete={() => setIntroDone(true)} />}
      {introDone && !montageDone && (
        <SurpriseMontage onComplete={() => setMontageDone(true)} />
      )}

      <SurpriseIntro ready={introDone} />
      <SurpriseMessage />
      <SurpriseMemories />
      <SurpriseMessageStars />
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
