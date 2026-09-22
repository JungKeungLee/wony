import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import ArchiveHero from "@/components/archive/ArchiveHero";
import MonthNav from "@/components/archive/MonthNav";
import ArchiveContent from "@/components/archive/ArchiveContent";
import NextChapter from "@/components/narrative/NextChapter";
import { archiveNotice } from "@/data/archive";

export const metadata: Metadata = {
  title: "2026 Broadcast Archive | WONY",
  description: "워니와 함께했던 2026년의 방송 기록",
};

export default function ArchivePage() {
  return (
    <>
      <Navigation />
      <main>
        <ArchiveHero />
        <MonthNav />
        <ArchiveContent />

        <p className="mx-auto max-w-3xl px-6 pb-4 pt-4 text-center text-xs leading-relaxed text-text-soft/60">
          {archiveNotice}
        </p>

        <NextChapter
          message={["수많은 기억을 모아놓고 보니\n문득 궁금해집니다.", "우리의 2026년은\n숫자로 보면 어떤 모습이었을까요?"]}
          title="숫자로 보는 2026년"
          href="/statistics"
          transitionPhrase="이번에는 조금 다른 방식으로 돌아봅니다."
        />
      </main>
    </>
  );
}
