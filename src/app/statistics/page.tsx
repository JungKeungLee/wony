import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import StatisticsHero from "@/components/statistics/StatisticsHero";
import StatCard from "@/components/statistics/StatCard";
import RecordCard from "@/components/statistics/RecordCard";
import QuoteOfTheYear from "@/components/statistics/QuoteOfTheYear";
import TopList from "@/components/statistics/TopList";
import MonthlyBarChart from "@/components/statistics/MonthlyBarChart";
import ChapterNote from "@/components/narrative/ChapterNote";
import NextChapter from "@/components/narrative/NextChapter";
import { STATISTICS_DATA } from "@/data/statistics";

export const metadata: Metadata = {
  title: "Statistics | WONY",
  description: "숫자로 돌아보는 워니의 2026년",
};

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-8 text-center font-display text-xs tracking-[0.4em] text-star">
      {children}
    </p>
  );
}

export default function StatisticsPage() {
  const { highlights, records, topContents, topGames, quoteOfTheYear, monthly } =
    STATISTICS_DATA;

  return (
    <>
      <Navigation />
      <main>
        <StatisticsHero />

        <section className="mx-auto max-w-4xl px-6 pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {highlights.map((highlight, i) => (
              <StatCard key={highlight.label} {...highlight} delay={i * 0.1} />
            ))}
          </div>
        </section>

        <ChapterNote lines={["숫자로 남겨놓고 보니", "참 많은 시간을 함께했습니다."]} />

        <section className="mx-auto max-w-4xl px-6 pb-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {records.map((record, i) => (
              <RecordCard key={record.title} {...record} delay={i * 0.08} />
            ))}
          </div>
        </section>

        <QuoteOfTheYear {...quoteOfTheYear} />

        <section className="mx-auto max-w-4xl px-6 py-20">
          <SectionLabel>TOP RANKING</SectionLabel>
          <div className="flex flex-col gap-12 sm:flex-row sm:gap-16">
            <div className="flex-1">
              <TopList title="TOP 3 CONTENT" items={topContents} />
            </div>
            <div className="flex-1">
              <TopList title="TOP 3 GAME" items={topGames} delay={0.1} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-16">
          <SectionLabel>MONTHLY</SectionLabel>
          <MonthlyBarChart data={monthly} />
        </section>

        <ChapterNote lines={["하지만 모든 기억을", "숫자로 표현할 수 있는 것은 아니었습니다."]} />

        <NextChapter
          message={["숫자로 남지 않은 이야기들은\n말과 마음으로 남았습니다."]}
          title="남겨진 마음 읽어보기"
          href="/letters"
          transitionPhrase="이번에는 조금 천천히 읽어봅니다."
        />
      </main>
    </>
  );
}
