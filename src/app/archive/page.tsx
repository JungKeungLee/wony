import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import ArchiveHero from "@/components/archive/ArchiveHero";
import MonthNav from "@/components/archive/MonthNav";
import ArchiveMonthSection from "@/components/archive/ArchiveMonthSection";
import { archiveData, archiveNotice, type ArchiveMonth } from "@/data/archive";

export const metadata: Metadata = {
  title: "2026 Broadcast Archive | WONY",
  description: "워니와 함께했던 2026년의 방송 기록",
};

const ALL_MONTH_LABELS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

// 데이터가 없는 달(현재 10~12월)도 항상 섹션이 존재하도록 1~12월을 전부 채운다.
const FULL_YEAR: ArchiveMonth[] = ALL_MONTH_LABELS.map((monthLabel, i) => {
  const month = i + 1;
  const existing = archiveData.find((entry) => entry.month === month);
  return existing ?? { month, monthLabel, items: [] };
});

export default function ArchivePage() {
  return (
    <>
      <Navigation />
      <main>
        <ArchiveHero />
        <MonthNav />

        {FULL_YEAR.map((monthData) => (
          <ArchiveMonthSection key={monthData.month} {...monthData} />
        ))}

        <p className="mx-auto max-w-3xl px-6 pb-24 pt-4 text-center text-xs leading-relaxed text-text-soft/60">
          {archiveNotice}
        </p>
      </main>
    </>
  );
}
