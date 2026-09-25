"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import type { VideoItem } from "@/lib/types";
import BestVideoAwardSequence from "./BestVideoAwardSequence";

interface BestVideoAwardProps {
  /** 승인된 전체 영상 목록 - best_rank가 있는 것만 이 안에서 골라 쓴다. */
  videos: VideoItem[];
  /** AwardsOpening이 완전히 사라진 뒤에만 true. 오프닝이 화면을 덮고 있는
   * 동안 발표 타이머가 몰래 진행되는 것을 막기 위한 게이트다. */
  openingDone: boolean;
}

/**
 * /awards 프로토타입 전용 wrapper. 실제 발표 연출(BEST VIDEO OF THE YEAR)은
 * BestVideoAwardSequence로 분리해, /videos의 전체화면 Award Overlay
 * (BestVideoAwardOverlay)와 코드를 공유한다 - 복사하지 않는다.
 *
 * 이 wrapper는 /awards만의 특수한 시작 조건(스크롤로 이 섹션에 들어왔는지
 * + 오프닝이 끝났는지)만 계산해서 active로 넘긴다. 이전 버전은 "isInView가
 * 되는 즉시" 타이머를 시작했는데, 이 섹션이 페이지 맨 위 오프닝 바로
 * 다음이라 오프닝이 화면을 덮고 있는 동안(약 2.2~2.8초) 이미 isInView가
 * true가 되어 3위 발표 구간이 그 뒤에서 몰래 지나가버렸다 - openingDone
 * 게이트를 추가해 근본 원인을 고쳤다.
 */
export default function BestVideoAward({ videos, openingDone }: BestVideoAwardProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="mx-auto flex max-w-lg flex-col items-center px-6 py-16 sm:py-20"
    >
      <BestVideoAwardSequence videos={videos} active={isInView && openingDone} />
    </section>
  );
}
