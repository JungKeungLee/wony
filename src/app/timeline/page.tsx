import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import TimelineHero from "@/components/timeline/TimelineHero";
import TimelineTrack from "@/components/timeline/TimelineTrack";
import NextChapter from "@/components/narrative/NextChapter";
import { TIMELINE_DATA } from "@/data/timeline";

export const metadata: Metadata = {
  title: "2026 Timeline | WONY",
  description: "워니와 팬들이 함께한 2026년 열두 달의 순간들",
};

export default function TimelinePage() {
  return (
    <>
      <Navigation />
      <main>
        <TimelineHero />
        <TimelineTrack months={TIMELINE_DATA} />
        <NextChapter
          message={["시간을 따라오다 보니\n조금 더 선명하게 남아 있는 순간들이 있습니다."]}
          title="기억을 조금 더 들여다보기"
          href="/archive"
          transitionPhrase="기억 속 장면을 하나씩 꺼내봅니다."
        />
      </main>
    </>
  );
}
