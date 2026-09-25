"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import SurpriseOpening from "./SurpriseOpening";
import SurpriseIntro from "./SurpriseIntro";
import SurpriseMontage from "./SurpriseMontage";
import SurpriseMessage from "./SurpriseMessage";
import SurpriseMemories from "./SurpriseMemories";
import SurpriseMessageStars from "./SurpriseMessageStars";
import SurpriseCredits from "./SurpriseCredits";
import SurpriseFinal from "./SurpriseFinal";
import SurpriseEndingVideo from "./SurpriseEndingVideo";
import { useAutoScroll } from "./useAutoScroll";

export default function SurpriseExperience() {
  const prefersReducedMotion = useReducedMotion();
  const [introDone, setIntroDone] = useState(false);
  const [montageDone, setMontageDone] = useState(false);
  const finalSectionRef = useRef<HTMLElement>(null);
  /** "See you in 2027 ✦" 제목 자체의 ref - 자동 스크롤 정지 조건과 엔딩 영상 트리거
   * 조건 둘 다 이 제목이 viewport 세로 중심에 도달했는지를 기준으로 판단한다. */
  const finalMessageRef = useRef<HTMLHeadingElement>(null);
  const { state, pause, resume, controlRef } = useAutoScroll({
    stopAtRef: finalMessageRef,
    // 오프닝과 사진 몽타주가 모두 끝나기 전에는 자동 스크롤이 절대 움직이지 않는다.
    enabled: !prefersReducedMotion && introDone && montageDone,
  });

  const showControl = state === "running" || state === "paused";

  // /surprise에 새로 진입할 때는 반드시 맨 처음(Opening/Intro)부터 시작해야 한다.
  // 브라우저나 Next.js router가 이 경로의 이전 스크롤 위치(예: 이전에 마지막
  // 구간까지 내려갔던 위치)를 복원해버리면, 마운트 직후 "See you in 2027 ✦"가
  // 이미 viewport 중심 부근에 있는 것처럼 보여 엔딩 영상이 즉시 트리거되는 원인이
  // 됐다. 마운트 시 한 번만 맨 위로 강제 이동시키고, 이 페이지를 벗어날 때는
  // scrollRestoration을 원래대로 되돌려 다른 페이지의 뒤로가기 동작에 영향을 주지
  // 않는다. 영상 종료 후 "기존 마지막 위치로 복귀"는 라우팅이나 리마운트 없이
  // 같은 페이지가 그대로 떠 있는 상태에서 오버레이만 사라지는 것이라 이 effect가
  // 다시 실행되지 않으며, 그 동작에는 전혀 영향을 주지 않는다.
  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  // "See you in 2027 ✦" 도달 여부 확인은 Intro/사진 몽타주가 모두 끝난 뒤에만
  // 시작한다 - 그 전에는(마운트 직후 포함) 절대 엔딩 트리거를 감시하지 않는다.
  const endingTriggerArmed = introDone && montageDone;

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
      <SurpriseFinal sectionRef={finalSectionRef} titleRef={finalMessageRef} />
      <SurpriseEndingVideo finalMessageRef={finalMessageRef} armed={endingTriggerArmed} />

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
