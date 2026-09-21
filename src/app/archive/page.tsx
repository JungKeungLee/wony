import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import ArchiveHero from "@/components/archive/ArchiveHero";
import MonthNav from "@/components/archive/MonthNav";
import ArchiveContent from "@/components/archive/ArchiveContent";
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

        <p className="mx-auto max-w-3xl px-6 pb-24 pt-4 text-center text-xs leading-relaxed text-text-soft/60">
          {archiveNotice}
        </p>
      </main>
    </>
  );
}
