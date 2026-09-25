"use client";

import { useEffect, useState } from "react";
import { fetchApprovedVideos } from "@/lib/videos";
import type { VideoItem } from "@/lib/types";
import { AWARDS_DATA } from "@/data/awards";
import ChapterNote from "@/components/narrative/ChapterNote";
import AwardsOpening from "./AwardsOpening";
import BestVideoAward from "./BestVideoAward";
import AwardCategoryReveal from "./AwardCategoryReveal";
import AwardsFinale from "./AwardsFinale";

/**
 * WONY AWARDS 2026 프로토타입. 다른 페이지와 최대한 얽히지 않도록 이 파일 하나가
 * 전체 순서를 조립한다 - 나중에 이 기능을 쓰지 않기로 하면 src/app/awards,
 * src/components/awards, src/data/awards.ts만 지우면 된다(기존 페이지 코드는
 * 전혀 참조하지 않는다).
 *
 * 순서: 오프닝 -> BEST VIDEO(기존 best_rank 재사용) -> 감성 문구 -> BEST CONTENT
 * -> BEST GAME -> 감성 문구 -> BEST COLLAB -> LEGENDARY MOMENT -> Grand Finale
 * (+ LETTER로 이어지는 CTA).
 */
export default function AwardsExperience() {
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchApprovedVideos()
      .then((data) => {
        if (!cancelled) setVideos(data);
      })
      .catch(() => {
        // 조회 실패해도 페이지 전체가 깨지면 안 된다 - BestVideoAward가 빈 배열을
        // 받으면 각 순위를 "선정 준비 중"으로 대체해 보여준다.
        if (!cancelled) setVideos([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative bg-bg">
      <AwardsOpening />

      <BestVideoAward videos={videos} />

      <ChapterNote lines={["2026년에는", "참 많은 순간들이 있었습니다."]} />

      <AwardCategoryReveal
        category="BEST CONTENT OF THE YEAR"
        title={AWARDS_DATA.bestContent.title}
        description={AWARDS_DATA.bestContent.description}
      />
      <AwardCategoryReveal
        category="BEST GAME OF THE YEAR"
        title={AWARDS_DATA.bestGame.title}
        description={AWARDS_DATA.bestGame.description}
      />

      <ChapterNote lines={["어떤 순간은 웃음으로,", "어떤 순간은 추억으로 남았습니다."]} />

      <AwardCategoryReveal
        category="BEST COLLAB OF THE YEAR"
        title={AWARDS_DATA.bestCollab.title}
        description={AWARDS_DATA.bestCollab.description}
      />
      <AwardCategoryReveal
        category="LEGENDARY MOMENT"
        title={AWARDS_DATA.legendaryMoment.title}
        description={AWARDS_DATA.legendaryMoment.description}
      />

      <AwardsFinale />
    </main>
  );
}
