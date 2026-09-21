"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import IntroPrelude from "./IntroPrelude";
import IntroVideo from "./IntroVideo";
import PhoneIntro from "./PhoneIntro";

interface IntroExperienceProps {
  /** 사용자가 WONY 앱을 눌러 스마트폰 확대 연출까지 끝났을 때 호출한다. */
  onComplete: () => void;
}

type Stage = "prelude" | "video" | "phone";

/**
 * 사이트 첫 진입 오프닝의 전체 흐름: 프렐류드(짧은 문구로 영상 재생을 완충) → 영상
 * (문자 도착 → 워니가 휴대폰을 확인하는 장면) → 스마트폰 UI(WONY 앱 클릭). 영상이
 * 끝나면(자연 종료/SKIP/로딩 실패 모두) 스마트폰 단계로 넘어가고, 스마트폰 단계는
 * 항상 사용자가 WONY 앱을 직접 눌러야만 다음(onComplete, 실제 HOME Hero)으로 이어진다.
 */
export default function IntroExperience({ onComplete }: IntroExperienceProps) {
  const [stage, setStage] = useState<Stage>("prelude");

  // 오프닝이 떠 있는 동안은 스크롤을 막는다(아직 HOME 본문은 마운트되지 않았지만,
  // 뒤로 넘어가는 순간에도 이어서 body 스크롤이 잠겨 있어야 화면이 튀지 않는다).
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[85] overflow-hidden bg-bg">
      <AnimatePresence>
        {stage === "prelude" && <IntroPrelude key="prelude" onComplete={() => setStage("video")} />}
        {stage === "video" && <IntroVideo key="video" onFinished={() => setStage("phone")} />}
        {stage === "phone" && <PhoneIntro key="phone" onComplete={onComplete} />}
      </AnimatePresence>
    </div>
  );
}
