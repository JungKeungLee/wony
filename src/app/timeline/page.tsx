import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import TimelineHero from "@/components/timeline/TimelineHero";
import TimelineTrack from "@/components/timeline/TimelineTrack";
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
      </main>
    </>
  );
}
